<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Property;
use App\Models\Booking;
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
}
