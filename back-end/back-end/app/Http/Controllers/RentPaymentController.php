<?php

namespace App\Http\Controllers;

use App\Models\RentalApplication;
use App\Models\RentPayment;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class RentPaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = RentPayment::with(['application.property.host', 'tenant'])->latest();

        if ($user->role === 'user') {
            $query->where('tenant_id', $user->id);
        } elseif ($user->role === 'homeowner') {
            $query->where('host_id', $user->id);
        }

        return response()->json($query->get()->map(fn (RentPayment $payment) => $this->transform($payment)));
    }

    public function store(Request $request, string $id)
    {
        if ($request->user()->role !== 'user') {
            return response()->json(['message' => 'Only renters can pay rent.'], 403);
        }

        $validated = $request->validate([
            'method' => 'required|string|in:card,in_person',
        ]);
        $application = RentalApplication::with('property')
            ->where('tenant_id', $request->user()->id)
            ->findOrFail($id);

        if ($application->status !== 'approved') {
            return response()->json(['message' => 'Rent payments are available after your application is approved.'], 422);
        }

        if (! $application->property || $application->property->price < 1) {
            return response()->json(['message' => 'This listing does not have a valid monthly rent amount.'], 422);
        }

        $period = now()->format('Y-m');
        $payment = DB::transaction(function () use ($application, $request, $validated, $period) {
            $payment = RentPayment::where('rental_application_id', $application->id)
                ->where('period', $period)
                ->lockForUpdate()
                ->first();

            if ($payment?->status === 'paid') {
                return null;
            }

            if ($payment?->status === 'processing') {
                return ['conflict' => true];
            }

            if ($payment?->status === 'pending') {
                if ($payment->method !== $validated['method']) {
                    return ['conflict' => true];
                }

                return $payment;
            }

            $payment ??= new RentPayment([
                'rental_application_id' => $application->id,
                'tenant_id' => $request->user()->id,
                'property_id' => $application->property->id,
                'host_id' => $application->property->host_id,
                'property_title' => $application->property->title,
                'city' => $application->property->city,
                'owner_name' => $application->property->host?->name ?? 'Unknown Owner',
                'owner_email' => $application->property->host?->email ?? '',
                'tenant_name' => $request->user()->name,
                'tenant_email' => $request->user()->email,
                'period' => $period,
            ]);
            $payment->fill([
                'amount_cents' => $application->property->price * 100,
                'currency' => 'usd',
                'method' => $validated['method'],
                'status' => $validated['method'] === 'card' ? 'processing' : 'pending',
                'checkout_session_id' => null,
                'checkout_url' => null,
                'paid_at' => null,
            ]);
            $payment->save();

            return $payment;
        });

        if (! $payment) {
            return response()->json(['message' => 'Rent for this month has already been paid.'], 409);
        }

        if (is_array($payment)) {
            return response()->json([
                'message' => 'A different rent payment method is already pending for this month. Contact the property owner to resolve it.',
            ], 409);
        }

        if ($validated['method'] === 'in_person') {
            return response()->json($this->transform($payment->load(['application.property.host', 'tenant'])), 201);
        }

        if ($payment->checkout_url) {
            return response()->json([
                ...$this->transform($payment->load(['application.property.host', 'tenant'])),
                'checkoutUrl' => $payment->checkout_url,
            ]);
        }

        if (! config('services.stripe.secret')) {
            $payment->update(['status' => 'failed']);

            return response()->json(['message' => 'Card payments are not configured. Set STRIPE_SECRET_KEY on the backend.'], 503);
        }

        $property = $application->property;
        $frontendUrl = rtrim(config('services.stripe.frontend_url'), '/');
        try {
            $response = Http::asForm()
                ->withToken(config('services.stripe.secret'))
                ->withHeaders(['Idempotency-Key' => "rent-payment-{$payment->id}-".Str::uuid()])
                ->timeout(15)
                ->post('https://api.stripe.com/v1/checkout/sessions', [
                    'mode' => 'payment',
                    'customer_email' => $request->user()->email,
                    'client_reference_id' => (string) $payment->id,
                    'success_url' => "{$frontendUrl}/?rent_payment=success&session_id={CHECKOUT_SESSION_ID}",
                    'cancel_url' => "{$frontendUrl}/?rent_payment=cancelled",
                    'line_items' => [[
                        'quantity' => 1,
                        'price_data' => [
                            'currency' => 'usd',
                            'unit_amount' => $payment->amount_cents,
                            'product_data' => [
                                'name' => "Monthly rent: {$property->title}",
                                'description' => "Rent for {$period}",
                            ],
                        ],
                    ]],
                    'metadata' => [
                        'payment_id' => (string) $payment->id,
                        'application_id' => (string) $application->id,
                        'period' => $period,
                    ],
                ]);
        } catch (ConnectionException) {
            $payment->update(['status' => 'failed']);

            return response()->json(['message' => 'Could not connect to Stripe. Please try again.'], 502);
        }

        $session = $response->json();
        if (! $response->successful() || ! is_string($session['url'] ?? null) || ! is_string($session['id'] ?? null)) {
            $payment->update(['status' => 'failed']);

            return response()->json([
                'message' => $session['error']['message'] ?? 'Stripe could not start card checkout. Please try again.',
            ], 502);
        }

        $payment->update([
            'status' => 'pending',
            'checkout_session_id' => $session['id'],
            'checkout_url' => $session['url'],
        ]);

        return response()->json([
            ...$this->transform($payment->fresh(['application.property.host', 'tenant'])),
            'checkoutUrl' => $session['url'],
        ], 201);
    }

    public function confirmInPersonPayment(Request $request, string $id)
    {
        $payment = RentPayment::with(['application.property', 'tenant'])->findOrFail($id);
        $user = $request->user();
        $isOwner = $payment->host_id === $user->id;

        if ($user->role !== 'admin' && ! $isOwner) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($payment->method !== 'in_person') {
            return response()->json(['message' => 'Only in-person payments can be confirmed manually.'], 422);
        }

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'This payment is no longer pending.'], 422);
        }

        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return response()->json($this->transform($payment->fresh(['application.property.host', 'tenant'])));
    }

    public function webhook(Request $request)
    {
        $secret = config('services.stripe.webhook_secret');
        if (! $secret) {
            return response()->json(['message' => 'Stripe webhook is not configured.'], 503);
        }

        $signatureHeader = $request->header('Stripe-Signature', '');
        $timestamp = null;
        $signatures = [];
        foreach (explode(',', $signatureHeader) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, null);
            if ($key === 't' && ctype_digit((string) $value)) {
                $timestamp = (int) $value;
            } elseif ($key === 'v1' && is_string($value)) {
                $signatures[] = $value;
            }
        }

        if ($timestamp === null || abs(time() - $timestamp) > 300 || $signatures === []) {
            return response()->json(['message' => 'Invalid Stripe signature.'], 400);
        }

        $payload = $request->getContent();
        $expected = hash_hmac('sha256', "{$timestamp}.{$payload}", $secret);
        if (! collect($signatures)->contains(fn (string $signature) => hash_equals($expected, $signature))) {
            return response()->json(['message' => 'Invalid Stripe signature.'], 400);
        }

        $event = json_decode($payload, true);
        if (! is_array($event)) {
            return response()->json(['message' => 'Invalid Stripe event payload.'], 400);
        }

        $session = $event['data']['object'] ?? [];
        $sessionId = $session['id'] ?? null;
        if (! is_string($sessionId)) {
            return response()->json(['message' => 'Stripe event is missing its checkout session.'], 400);
        }

        $payment = RentPayment::where('checkout_session_id', $sessionId)->first();
        if ($payment) {
            if (($event['type'] ?? '') === 'checkout.session.completed'
                && ($session['payment_status'] ?? '') === 'paid'
                && $payment->status !== 'paid') {
                $payment->update([
                    'status' => 'paid',
                    'checkout_url' => null,
                    'paid_at' => now(),
                ]);
            } elseif (in_array($event['type'] ?? '', [
                'checkout.session.expired',
                'checkout.session.async_payment_failed',
            ], true) && $payment->status !== 'paid') {
                $payment->update(['status' => 'failed', 'checkout_url' => null]);
            }
        }

        return response()->json(['received' => true]);
    }

    private function transform(RentPayment $payment): array
    {
        return [
            'id' => (string) $payment->id,
            'applicationId' => (string) $payment->rental_application_id,
            'propertyId' => (string) ($payment->property_id ?? ''),
            'propertyTitle' => $payment->property_title,
            'ownerName' => $payment->owner_name,
            'tenantName' => $payment->tenant_name,
            'tenantEmail' => $payment->tenant_email,
            'period' => $payment->period,
            'amountCents' => $payment->amount_cents,
            'currency' => $payment->currency,
            'method' => $payment->method,
            'status' => $payment->status,
            'paidAt' => $payment->paid_at?->toIso8601String(),
        ];
    }
}
