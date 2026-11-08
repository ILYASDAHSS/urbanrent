<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->is_suspended) {
            return response()->json(['message' => 'This account is suspended. Contact an administrator.'], 403);
        }

        return $next($request);
    }
}
