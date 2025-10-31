<?php

namespace App\Http\Controllers;

use App\Mail\OneTimeCodeMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    private function generateCode(): string
    {
        $alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        $out = '';
        for ($i = 0; $i < 6; $i++) {
            $out .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }

        return $out;
    }

    private function sendEmailVerification(User $user): void
    {
        $user->email_verification_code = $this->generateCode();
        $user->email_verification_expires_at = now()->addMinutes(10);
        $user->save();

        Mail::to($user->email)->queue(new OneTimeCodeMail($user->email_verification_code, 'Vérification e-mail'));
    }

    private function sendTwoFactor(User $user): void
    {
        $user->two_factor_code = $this->generateCode();
        $user->two_factor_expires_at = now()->addMinutes(10);
        $user->save();

        Mail::to($user->email)->queue(new OneTimeCodeMail($user->two_factor_code, 'Connexion'));
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:12', // CNIL 2022 - 12 caractères minimum
                'regex:/[a-z]/', // Au moins une minuscule
                'regex:/[A-Z]/', // Au moins une majuscule
                'regex:/[0-9]/', // Au moins un chiffre
                'regex:/[@$!%*#?&]/', // Au moins un caractère spécial
            ],
            'date_of_birth' => 'required|date|before:today',
        ], [
            'date_of_birth.before' => 'La date de naissance doit être antérieure à aujourd\'hui.',
            'password.min' => 'Le mot de passe doit contenir au moins 12 caractères.',
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*#?&).',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'date_of_birth' => Carbon::parse($request->date_of_birth)->toDateString(),
        ]);

        if (! Role::where('name', 'user')->exists()) {
            Role::create(['name' => 'user']);
        }
        $user->assignRole('user');

        $this->sendEmailVerification($user);

        return response()->json([
            'message' => 'User created. Verification code sent by email.',
            'status' => 'verification_required',
        ], 201);
    }

    public function verifyEmail(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $data['email'])->first();
        if (! $user) {
            abort(404, 'User not found');
        }

        if (
            ! $user->email_verification_code ||
            ! $user->email_verification_expires_at ||
            now()->greaterThan($user->email_verification_expires_at) ||
            strtoupper($data['code']) !== $user->email_verification_code
        ) {
            throw ValidationException::withMessages(['code' => ['Invalid or expired code']]);
        }

        $user->email_verified_at = now();
        $user->email_verification_code = null;
        $user->email_verification_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Email verified successfully']);
    }

    public function resendEmailCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified'], 422);
        }

        $this->sendEmailVerification($user);

        // TEMPORARY: Return code in response for debugging email issues
        $response = ['message' => 'A new verification code has been sent'];
        if (env('SHOW_VERIFICATION_CODE', false)) {
            $response['verification_code'] = $user->email_verification_code;
        }

        return response()->json($response);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! \Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'message' => ['The provided credentials are incorrect'],
            ]);
        }

        if (! $user->email_verified_at) {
            $this->sendEmailVerification($user);

            return response()->json([
                'status' => 'verification_required',
                'message' => 'Email not verified. A code has been sent to your inbox.',
            ], 403);
        }

        $this->sendTwoFactor($user);

        return response()->json([
            'status' => '2fa_required',
            'message' => 'A login code has been sent to your email.',
        ]);
    }

    public function verify2fa(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if (
            ! $user->two_factor_code ||
            ! $user->two_factor_expires_at ||
            now()->greaterThan($user->two_factor_expires_at) ||
            strtoupper($data['code']) !== $user->two_factor_code
        ) {
            throw ValidationException::withMessages(['code' => ['Invalid or expired code']]);
        }

        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        $token = $user->createToken($user->email)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function resend2fa(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->firstOrFail();
        $this->sendTwoFactor($user);

        return response()->json(['message' => 'A new login code has been sent']);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
            'roles' => $request->user()->getRoleNames(),
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])->first();
        if ($user) {
            $user->password_reset_code = $this->generateCode();
            $user->password_reset_expires_at = now()->addMinutes(10);
            $user->save();

            Mail::to($user->email)->send(
                new OneTimeCodeMail($user->password_reset_code, 'Réinitialisation du mot de passe')
            );
        }

        return response()->json([
            'message' => 'Si un compte existe pour cet e-mail, un code a été envoyé.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => [
                'required',
                'string',
                'min:12', // CNIL 2022 - 12 caractères minimum
                'regex:/[a-z]/', // Au moins une minuscule
                'regex:/[A-Z]/', // Au moins une majuscule
                'regex:/[0-9]/', // Au moins un chiffre
                'regex:/[@$!%*#?&]/', // Au moins un caractère spécial
                'confirmed',
            ],
        ], [
            'password.min' => 'Le mot de passe doit contenir au moins 12 caractères.',
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*#?&).',
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if (
            ! $user->password_reset_code ||
            ! $user->password_reset_expires_at ||
            now()->greaterThan($user->password_reset_expires_at) ||
            strtoupper($data['code']) !== $user->password_reset_code
        ) {
            throw ValidationException::withMessages(['code' => ['Invalid or expired code']]);
        }

        $user->password = \Hash::make($data['password']);
        $user->password_reset_code = null;
        $user->password_reset_expires_at = null;

        $user->tokens()->delete();

        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }
}
