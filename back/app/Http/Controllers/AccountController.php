<?php

namespace App\Http\Controllers;

use App\Models\EmailChangeRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function requestEmailChange(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'new_email' => 'required|email|max:255|unique:users,email',
            'current_password' => 'required|string',
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mot de passe incorrect.'],
            ]);
        }

        EmailChangeRequest::where('user_id', $user->id)->delete();

        $token = Str::random(64);
        $ecr = EmailChangeRequest::create([
            'user_id' => $user->id,
            'new_email' => $data['new_email'],
            'token' => $token,
            'expires_at' => now()->addHours(24),
        ]);

        $confirmUrl = route('account.email.confirm', ['token' => $token]);

        Mail::raw(
            "Bonjour,\n\nCliquez sur ce lien pour confirmer votre changement d'adresse e-mail :\n{$confirmUrl}\n\nCe lien expire dans 24h.",
            function ($message) use ($ecr) {
                $message->to($ecr->new_email)
                    ->subject('Confirmez votre changement d’e-mail');
            }
        );

        return response()->json([
            'message' => 'Demande envoyée. Vérifiez votre nouvelle adresse e-mail pour confirmer.',
            'confirm_url' => $confirmUrl,
        ]);
    }

    public function confirmEmailChange(string $token)
    {
        $req = EmailChangeRequest::where('token', $token)
            ->where('expires_at', '>', now())
            ->first();

        if (! $req) {
            return response()->view('account.email_change_error', [
                'message' => 'Lien invalide ou expiré.',
            ], 400);
        }

        $user = User::find($req->user_id);
        if (! $user) {
            return response()->view('account.email_change_error', [
                'message' => 'Utilisateur introuvable.',
            ], 404);
        }

        $user->email = $req->new_email;
        $user->email_verified_at = now();
        $user->save();

        $req->delete();

        return response()->view('account.email_change_success', [
            'email' => $user->email,
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => [
                'required',
                'string',
                'min:12',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&]/',
                'different:current_password',
            ],
        ], [
            'new_password.different' => "Le nouveau mot de passe doit être différent de l'actuel.",
            'new_password.min' => 'Le mot de passe doit contenir au moins 12 caractères.',
            'new_password.regex' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*#?&).',
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mot de passe incorrect.'],
            ]);
        }

        $user->password = Hash::make($data['new_password']);
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }
}
