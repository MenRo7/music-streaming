<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Music;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function show($id)
    {
        $user = \App\Models\User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        return response()->json([
            'id' => (int) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
            'updated_at' => $user->updated_at,
        ]);
    }

    public function summary($id)
    {
        $user = \App\Models\User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $musics = \App\Models\Music::where('user_id', $user->id)
            ->with(['user:id,name', 'album:id,title', 'playlists:id'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($m) {
                return [
                    'id'              => (int) $m->id,
                    'name'            => $m->title,
                    'artist'          => optional($m->user)->name ?? $m->artist_name,
                    'album'           => optional($m->album)->title ?? 'Inconnu',
                    'album_image'     => $m->image
                        ? asset('storage/' . $m->image) . '?v=' . optional($m->updated_at)->timestamp
                        : null,
                    'audio'           => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
                    'duration'        => $m->duration,
                    'date_added'      => optional($m->created_at)?->toDateString(),
                    'playlist_ids'    => $m->playlists->pluck('id')->map(fn($id)=>(int)$id)->values()->all(),
                    'album_id'        => $m->album_id ? (int) $m->album_id : null,
                    'artist_user_id'  => $m->user_id ? (int) $m->user_id : null,
                ];
            });

        $albums = \App\Models\Album::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($a) {
                return [
                    'id'          => (int) $a->id,
                    'title'       => $a->title,
                    'type'        => $a->type,
                    'image'       => $a->image ? asset('storage/' . $a->image) : null,
                    'user_id'     => (int) $a->user_id,
                    'artist_name' => $a->artist_name,
                    'created_at'  => optional($a->created_at)?->format('d/m/Y'),
                ];
            });

        $playlists = \App\Models\Playlist::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($pl) {
                return [
                    'id'    => (int) $pl->id,
                    'title' => $pl->title,
                    'image' => $pl->image ? asset('storage/' . $pl->image) : null,
                ];
            });

        return response()->json([
            'user'      => [
                'id' => (int) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
            ],
            'musics'    => $musics,
            'albums'    => $albums,
            'playlists' => $playlists,
        ]);
    }

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

    public function likesSummary()
    {
        $user = Auth::user();

        $albums = $user->likedAlbums()
            ->select('albums.id', 'albums.title', 'albums.image')
            ->get()
            ->map(function ($a) {
                return [
                    'id' => (int) $a->id,
                    'title' => $a->title,
                    'image' => $a->image ? asset('storage/' . $a->image) : null,
                ];
            });

        $playlists = $user->likedPlaylists()
            ->select('playlists.id', 'playlists.title', 'playlists.image')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => (int) $p->id,
                    'title' => $p->title,
                    'image' => $p->image ? asset('storage/' . $p->image) : null,
                ];
            });

        return response()->json([
            'albums' => $albums,
            'playlists' => $playlists,
        ]);
    }
}
