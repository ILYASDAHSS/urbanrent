<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\User;
use App\Services\NewsletterService;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function __construct(private NewsletterService $newsletterService) {}

    public function send(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'userId' => 'nullable|exists:users,id',
            'propertyId' => 'nullable|exists:properties,id',
            'context' => 'nullable|string|in:general,listing,purchase,application,booking',
            'message' => 'nullable|string|max:2000',
        ]);

        $targetUser = $validated['userId']
            ? User::findOrFail($validated['userId'])
            : $request->user();
        $property = isset($validated['propertyId']) ? Property::with('host')->findOrFail($validated['propertyId']) : null;

        if ($request->user()->role !== 'admin' && $targetUser->id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $this->newsletterService->send(
            user: $targetUser,
            property: $property,
            context: $validated['context'] ?? ($property ? 'listing' : 'general'),
            customMessage: $validated['message'] ?? null,
        );

        return response()->json([
            'message' => 'Newsletter email queued successfully.',
            'recipient' => $targetUser->email,
        ]);
    }
}
