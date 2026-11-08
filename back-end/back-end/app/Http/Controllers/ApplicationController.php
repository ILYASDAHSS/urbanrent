<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\RentalApplication;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = RentalApplication::with(['property.host', 'tenant'])->latest();

        if ($user->role === 'user') {
            $query->where('tenant_id', $user->id);
        } elseif ($user->role === 'homeowner') {
            $query->whereHas('property', fn ($q) => $q->where('host_id', $user->id));
        }

        return response()->json($query->get()->map(fn ($application) => $this->transform($application)));
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'user') {
            return response()->json(['message' => 'Only renters can submit an application.'], 403);
        }

        $validated = $request->validate([
            'propertyId' => 'required|exists:properties,id',
            'message' => 'required|string|max:2000',
            'moveInDate' => 'nullable|date',
            'occupants' => 'nullable|integer|min:1|max:12',
            'employment' => 'nullable|string|max:255',
        ]);

        $property = Property::findOrFail($validated['propertyId']);
        if ($property->listing_status !== 'available') {
            return response()->json(['message' => 'This home is not currently accepting applications.'], 422);
        }

        $open = RentalApplication::where('property_id', $property->id)
            ->where('tenant_id', $request->user()->id)
            ->where('status', 'submitted')
            ->exists();

        if ($open) {
            return response()->json(['message' => 'You already have an open application for this home.'], 422);
        }

        $application = RentalApplication::create([
            'property_id' => $property->id,
            'tenant_id' => $request->user()->id,
            'message' => $validated['message'],
            'move_in_date' => $validated['moveInDate'] ?? null,
            'occupants' => $validated['occupants'] ?? 1,
            'employment' => $validated['employment'] ?? null,
            'status' => 'submitted',
        ]);

        $application->load(['property.host', 'tenant']);

        return response()->json($this->transform($application), 201);
    }

    public function update(Request $request, $id)
    {
        $application = RentalApplication::with(['property.host', 'tenant'])->findOrFail($id);
        $user = $request->user();
        $ownsProperty = $application->property && $application->property->host_id === $user->id;

        if ($user->role !== 'admin' && ! $ownsProperty) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:submitted,approved,declined',
        ]);

        $application->update(['status' => $validated['status']]);

        return response()->json($this->transform($application->fresh(['property.host', 'tenant'])));
    }

    private function transform(RentalApplication $application): array
    {
        return [
            'id' => (string) $application->id,
            'propertyId' => (string) $application->property_id,
            'propertyTitle' => $application->property?->title ?? 'Listing',
            'propertyImage' => $application->property?->image ?? '',
            'propertyAddress' => $application->property
                ? trim($application->property->address.', '.$application->property->city)
                : '',
            'tenantName' => $application->tenant?->name ?? 'Renter',
            'tenantEmail' => $application->tenant?->email ?? '',
            'tenantPhone' => $application->tenant?->phone ?? '',
            'message' => $application->message,
            'moveInDate' => $application->move_in_date?->toDateString(),
            'occupants' => (int) $application->occupants,
            'employment' => $application->employment,
            'status' => $application->status,
            'createdAt' => $application->created_at?->toIso8601String(),
        ];
    }
}
