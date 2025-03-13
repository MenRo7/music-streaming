<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AuthController extends Controller
{
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if (!Role::where('name', 'user')->exists()) {
            Role::create(['name' => 'user']);
        }

        $user->assignRole('user');

        return response()->json([
            'message' => 'Successfully created user',
        ]);
    }

    public function login(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'message' => ['The provided credentials are incorrect'],
            ]);
        }

        $token = $user->createToken($request->email)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request) {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    public function user(Request $request) {

        return response()->json([
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
            'roles' => $request->user()->getRolesNames(),
        ]);
    }
}
