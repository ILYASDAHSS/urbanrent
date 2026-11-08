<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Services\AddressGeocoder;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with('host');
        $user = $request->user();

        if ($user?->role !== 'admin') {
            $query->where(function ($listings) use ($user) {
                $listings->where('listing_status', 'available');
                if ($user?->role === 'homeowner') {
                    $listings->orWhere('host_id', $user->id);
                }
            });
        }

        $properties = $query->get();
        return response()->json($properties->map(fn($p) => $this->transformProperty($p)));
    }

    public function geocode(Request $request, AddressGeocoder $geocoder)
    {
        $validated = $request->validate([
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'zipCode' => 'nullable|string|max:20',
        ]);

        return response()->json($geocoder->locate(
            $validated['address'],
            $validated['city'],
            $validated['neighborhood'] ?? null,
            $validated['zipCode'] ?? null,
        ));
    }

    public function store(Request $request, AddressGeocoder $geocoder)
    {
        if ($request->user()->role !== 'homeowner' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only homeowners can list properties.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'neighborhood' => 'required|string|max:255',
            'zipCode' => 'required|string|max:20',
            'price' => 'required|integer|min:0',
            'beds' => 'required|string',
            'baths' => 'required|numeric|min:0',
            'sqft' => 'required|integer|min:0',
            'type' => 'required|string|in:Apartment,Loft,Studio,Penthouse,Townhouse',
            'image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'petFriendly' => 'nullable|boolean',
            'inUnitLaundry' => 'nullable|boolean',
            'parking' => 'nullable|boolean',
            'balcony' => 'nullable|boolean',
            'gym' => 'nullable|boolean',
            'pool' => 'nullable|boolean',
            'evCharging' => 'nullable|boolean',
            'description' => 'required|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'amenities' => 'nullable|array',
            'deposit' => 'nullable|integer',
            'leaseTerms' => 'nullable|string',
            'availableDate' => 'nullable|string',
        ]);

        if (isset($validated['lat'], $validated['lng'])) {
            $lat = (float) $validated['lat'];
            $lng = (float) $validated['lng'];
        } else {
            $located = $geocoder->locate(
                $validated['address'],
                $validated['city'],
                $validated['neighborhood'],
                $validated['zipCode'],
            );
            $lat = $located['lat'];
            $lng = $located['lng'];
        }
        $image = $validated['image'] ?? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
        $gallery = $validated['gallery'] ?? [$image];

        $property = Property::create([
            'host_id' => $request->user()->id,
            'title' => $validated['title'],
            'address' => $validated['address'],
            'city' => $validated['city'],
            'neighborhood' => $validated['neighborhood'],
            'zip_code' => $validated['zipCode'],
            'price' => $validated['price'],
            'beds' => $validated['beds'],
            'baths' => $validated['baths'],
            'sqft' => $validated['sqft'],
            'image' => $image,
            'gallery' => $gallery,
            'badge' => 'JUST LISTED',
            'listing_status' => 'pending_review',
            'type' => $validated['type'],
            'pet_friendly' => (bool)($validated['petFriendly'] ?? false),
            'in_unit_laundry' => (bool)($validated['inUnitLaundry'] ?? false),
            'parking' => (bool)($validated['parking'] ?? false),
            'balcony' => (bool)($validated['balcony'] ?? false),
            'gym' => (bool)($validated['gym'] ?? false),
            'pool' => (bool)($validated['pool'] ?? false),
            'ev_charging' => (bool)($validated['evCharging'] ?? false),
            'description' => $validated['description'],
            'rating' => 5.0,
            'review_count' => 0,
            'lat' => $lat,
            'lng' => $lng,
            'amenities' => $validated['amenities'] ?? ['Balcony', 'Dishwasher', 'Storage'],
            'deposit' => $validated['deposit'] ?? $validated['price'],
            'lease_terms' => $validated['leaseTerms'] ?? '12 Months',
            'available_date' => $validated['availableDate'] ?? 'Immediately',
        ]);

        $property->load('host');

        return response()->json($this->transformProperty($property), 201);
    }

    public function update(Request $request, $id)
    {
        $property = Property::with('host')->findOrFail($id);

        if ($request->user()->role !== 'admin' && $property->host_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (! in_array($property->listing_status, ['available', 'leased'], true)) {
            return response()->json(['message' => 'This listing must be approved by an administrator before it can be changed.'], 422);
        }

        $validated = $request->validate([
            'listingStatus' => 'required|string|in:available,leased',
        ]);

        $property->update([
            'listing_status' => $validated['listingStatus'],
            'badge' => $validated['listingStatus'] === 'leased' ? null : ($property->badge ?: 'AVAILABLE NOW'),
        ]);

        return response()->json($this->transformProperty($property->fresh('host')));
    }

    public function moderate(Request $request, $id)
    {
        $validated = $request->validate([
            'listingStatus' => 'required|string|in:available,rejected',
        ]);
        $property = Property::with('host')->findOrFail($id);

        if ($property->listing_status !== 'pending_review') {
            return response()->json(['message' => 'Only listings awaiting review can be moderated.'], 422);
        }

        $property->update([
            'listing_status' => $validated['listingStatus'],
            'badge' => $validated['listingStatus'] === 'available' ? 'JUST LISTED' : null,
        ]);

        return response()->json($this->transformProperty($property->fresh('host')));
    }

    public function destroy(Request $request, $id)
    {
        $property = Property::findOrFail($id);

        if ($request->user()->role !== 'admin' && $property->host_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted successfully.']);
    }

    private function transformProperty($p)
    {
        return [
            'id' => (string)$p->id,
            'title' => $p->title,
            'address' => $p->address,
            'city' => $p->city,
            'neighborhood' => $p->neighborhood,
            'zipCode' => $p->zip_code,
            'price' => (int)$p->price,
            'beds' => is_numeric($p->beds) ? (int)$p->beds : $p->beds,
            'baths' => (double)$p->baths,
            'sqft' => (int)$p->sqft,
            'image' => $p->image,
            'gallery' => $p->gallery ?? [],
            'badge' => $p->badge,
            'listingStatus' => $p->listing_status ?: 'available',
            'type' => $p->type,
            'petFriendly' => (bool)$p->pet_friendly,
            'inUnitLaundry' => (bool)$p->in_unit_laundry,
            'parking' => (bool)$p->parking,
            'balcony' => (bool)$p->balcony,
            'gym' => (bool)$p->gym,
            'pool' => (bool)$p->pool,
            'evCharging' => (bool)$p->ev_charging,
            'description' => $p->description,
            'rating' => (double)$p->rating,
            'reviewCount' => (int)$p->review_count,
            'lat' => (double)$p->lat,
            'lng' => (double)$p->lng,
            'amenities' => $p->amenities ?? [],
            'deposit' => (int)$p->deposit,
            'leaseTerms' => $p->lease_terms,
            'availableDate' => $p->available_date,
            'host' => [
                'name' => $p->host ? $p->host->name : 'Unknown Host',
                'avatar' => $p->host && $p->host->avatar ? $p->host->avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'phone' => $p->host && $p->host->phone ? $p->host->phone : '(555) 000-0000',
                'email' => $p->host ? $p->host->email : '',
                'isSuperhost' => $p->host ? (bool)$p->host->is_superhost : false,
            ]
        ];
    }
}
