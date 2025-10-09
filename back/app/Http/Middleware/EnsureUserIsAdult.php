<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsAdult
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !$user->date_of_birth) {
            return response()->json([
                'error' => 'Vous devez renseigner votre date de naissance pour accéder à cette fonctionnalité.',
                'code' => 'BIRTHDATE_REQUIRED'
            ], 403);
        }

        if ($user->date_of_birth->age < 18) {
            return response()->json([
                'error' => 'Cette fonctionnalité est réservée aux utilisateurs majeurs (18 ans et plus). Les fonctionnalités de paiement et de donations sont soumises à des restrictions légales.',
                'code' => 'ADULT_ONLY',
                'user_age' => $user->date_of_birth->age
            ], 403);
        }

        return $next($request);
    }
}
