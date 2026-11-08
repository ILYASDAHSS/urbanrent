<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->favoriteProperties()->pluck('properties.id')->map(
                fn ($id) => (string) $id
            )
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'propertyId' => 'required|integer|exists:properties,id',
        ]);

        $request->user()->favoriteProperties()->syncWithoutDetaching([
            $validated['propertyId'],
        ]);

        return response()->json(['propertyId' => (string) $validated['propertyId']], 201);
    }

    public function destroy(Request $request, int $propertyId)
    {
        $request->user()->favoriteProperties()->detach($propertyId);

        return response()->noContent();
    }
}
