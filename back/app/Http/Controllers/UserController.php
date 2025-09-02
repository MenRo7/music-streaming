<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Music;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function getUser()
    {
        if (Auth::check()) {
            $user = Auth::user();

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
                'updated_at' => $user->updated_at,
            ]);
        } else {
            return response()->json(['message' => 'Non authentifié'], 401);
        }
    }

    public function updateUser(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png',
        ]);

        $oldName = $user->name;
        $user->name = $request->input('name');

        if ($request->hasFile('image')) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $path = $request->file('image')->store('profile_images', 'public');
            $user->profile_image = $path;
        }

        $user->save();

        if ($oldName !== $user->name) {
            Music::where('user_id', $user->id)->update(['artist_name' => $user->name]);
        }

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
            ],
        ], 200);
    }
}
