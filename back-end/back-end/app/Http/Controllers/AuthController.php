<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:user,homeowner',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->is_suspended) {
            return response()->json([
                'message' => 'This account is suspended. Contact an administrator.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:30',
            'city' => 'nullable|string|max:120',
            'occupation' => 'nullable|string|max:120',
            'bio' => 'nullable|string|max:500',
            'move_in_date' => 'nullable|date',
            'budget_min' => 'nullable|integer|min:0|max:100000',
            'budget_max' => 'nullable|integer|min:0|max:100000',
            'pets' => 'nullable|string|max:120',
            'household_size' => 'nullable|integer|min:1|max:12',
        ]);

        $user = $request->user();
        $user->update($validated);

        return response()->json($user->fresh());
    }

    public function updateAvatar(Request $request)
    {
        $validated = $request->validate([
            'avatar' => 'required|image|max:5120',
        ]);

        $path = $validated['avatar']->store('avatars', 'public');
        if ($path === false) {
            throw new RuntimeException('Unable to store the profile photo.');
        }

        $user = $request->user();
        $user->update(['avatar' => '/storage/'.$path]);

        return response()->json($user->fresh());
    }
}
