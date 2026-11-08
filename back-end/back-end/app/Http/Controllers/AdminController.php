<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Property;
use App\Models\RentPayment;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        return response()->json([
            'totalUsers' => User::count(),
            'totalHomeowners' => User::where('role', 'homeowner')->count(),
            'totalTenants' => User::where('role', 'user')->count(),
            'totalProperties' => Property::count(),
            'pendingProperties' => Property::where('listing_status', 'pending_review')->count(),
            'totalBookings' => Booking::count(),
        ]);
    }

    public function users(Request $request)
    {
        return response()->json(User::orderBy('id', 'desc')->get());
    }

    public function updateUserRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|in:admin,homeowner,user',
        ]);

        $user = User::findOrFail($id);

        $user->update([
            'role' => $request->role,
        ]);

        return response()->json($user);
    }

    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself.'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function updateUserSuspension(Request $request, $id)
    {
        $validated = $request->validate([
            'suspended' => 'required|boolean',
        ]);
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot suspend or reinstate yourself.'], 400);
        }

        $user->update(['is_suspended' => $validated['suspended']]);

        return response()->json($user);
    }

    public function monthlyReport(Request $request)
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);
        $month = $validated['month'];
        $properties = Property::with('host')->orderBy('id')->get();
        $payments = RentPayment::with(['application.property.host', 'tenant'])
            ->where('period', $month)
            ->orderBy('id')
            ->get();

        return response()->streamDownload(function () use ($properties, $payments, $month) {
            $output = fopen('php://output', 'w');
            fputcsv($output, [
                'record_type', 'month', 'property_id', 'property_title', 'city', 'monthly_rent',
                'owner_name', 'owner_email', 'tenant_name', 'tenant_email',
                'payment_method', 'payment_status', 'amount', 'currency', 'payment_id', 'payment_reference', 'paid_at',
            ]);

            foreach ($properties as $property) {
                fputcsv($output, $this->safeCsvRow([
                    'listing', $month, $property->id, $property->title, $property->city,
                    $property->price, $property->host?->name, $property->host?->email,
                    '', '', '', '', '', '', '', '', '',
                ]));
            }

            foreach ($payments as $payment) {
                fputcsv($output, $this->safeCsvRow([
                    'payment', $payment->period, $payment->property_id, $payment->property_title, $payment->city,
                    $payment->amount_cents / 100, $payment->owner_name, $payment->owner_email,
                    $payment->tenant_name, $payment->tenant_email, $payment->method,
                    $payment->status, number_format($payment->amount_cents / 100, 2, '.', ''),
                    strtoupper($payment->currency), $payment->id, $payment->checkout_session_id, $payment->paid_at?->toIso8601String(),
                ]));
            }

            fclose($output);
        }, "urbanrent-monthly-report-{$month}.csv", [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Prefix spreadsheet formula-like values so exported user content stays inert.
     */
    private function safeCsvRow(array $values): array
    {
        return array_map(function ($value) {
            if (! is_string($value)) {
                return $value;
            }

            return preg_match('/^\s*[=+\-@]/', $value) ? "'".$value : $value;
        }, $values);
    }
}
