<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsAdult
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user || !$user->date_of_birth || $user->date_of_birth->age < 18) {
            return response()->json([
                'error' => 'Action non autorisée : vous devez avoir au moins 18 ans.'
            ], 403);
        }
        return $next($request);
    }
}
