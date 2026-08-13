<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Property;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $bookings = Booking::with(['property.host', 'user'])->latest()->get();
        } elseif ($user->role === 'homeowner') {
            $bookings = Booking::whereHas('property', function ($query) use ($user) {
                $query->where('host_id', $user->id);
            })->with(['property.host', 'user'])->latest()->get();
        } else {
            $bookings = Booking::where('user_id', $user->id)->with(['property.host', 'user'])->latest()->get();
        }

        return response()->json($bookings->map(fn($b) => $this->transformBooking($b)));
    }

    public function store(Request $request)
    {
        $request->validate([
            'propertyId' => 'required|exists:properties,id',
            'date' => 'required|string',
            'time' => 'required|string',
            'type' => 'required|string|in:in-person,virtual',
        ]);

        $property = Property::with('host')->findOrFail($request->propertyId);

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'property_id' => $property->id,
            'date' => $request->date,
            'time' => $request->time,
            'type' => $request->type,
            'status' => 'Pending',
            'host_name' => $property->host ? $property->host->name : 'Unknown Host',
        ]);

        return response()->json($this->transformBooking($booking->load(['property.host', 'user'])), 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Confirmed,Pending,Completed,Cancelled',
        ]);

        $booking = Booking::with('property')->findOrFail($id);
        $user = $request->user();

        $isAuthorized = false;

        if ($user->role === 'admin') {
            $isAuthorized = true;
        } elseif ($user->role === 'homeowner' && $booking->property->host_id === $user->id) {
            $isAuthorized = true;
        } elseif ($user->role === 'user' && $booking->user_id === $user->id && $request->status === 'Cancelled') {
            $isAuthorized = true;
        }

        if (! $isAuthorized) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $booking->update([
            'status' => $request->status,
        ]);

        return response()->json($this->transformBooking($booking->load(['property.host', 'user'])));
    }

    public function destroy(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'admin' && $booking->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully.']);
    }

    private function transformBooking($b)
    {
        return [
            'id' => (string)$b->id,
            'propertyId' => (string)$b->property_id,
            'propertyTitle' => $b->property ? $b->property->title : 'Unknown Property',
            'propertyImage' => $b->property ? $b->property->image : '',
            'date' => $b->date,
            'time' => $b->time,
            'type' => $b->type,
            'status' => $b->status,
            'hostName' => $b->host_name,
            'tenantName' => $b->user ? $b->user->name : 'Unknown Tenant',
            'tenantEmail' => $b->user ? $b->user->email : '',
            'tenantPhone' => $b->user ? $b->user->phone : '',
        ];
    }
}
