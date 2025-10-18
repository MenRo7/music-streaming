<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PlaylistController extends Controller
{
    public function index()
    {
        $playlists = Auth::user()->playlists->map(function ($playlist) {
            return [
                'id' => $playlist->id,
                'title' => $playlist->title,
                'image' => $playlist->image ? asset('storage/' . $playlist->image) : null,
            ];
        });

        return response()->json($playlists);
    }

    public function show($id)
    {
        $playlist = Playlist::with([
            'user:id,name',
            'musics' => function ($q) {
                $q->with([
                    'user:id,name',
                    'album:id,title,image',
                    'playlists:id',
                ]);
            },
        ])->find($id);

        if (! $playlist) {
            return response()->json(['message' => 'Playlist non trouvée'], 404);
        }

        $isLiked = Auth::check()
            ? $playlist->likedBy()->where('user_id', Auth::id())->exists()
            : false;

        return response()->json([
            'id' => $playlist->id,
            'user_id' => (int) $playlist->user_id,
            'creator_name' => optional($playlist->user)->name,
            'title' => $playlist->title,
            'image' => $playlist->image ? asset('storage/' . $playlist->image) : null,
            'is_liked' => $isLiked,

            'songs' => $playlist->musics->map(function ($music) {
                return [
                    'id' => (int) $music->id,
                    'name' => $music->title,
                    'artist' => optional($music->user)->name ?? $music->artist_name,
                    'artist_user_id' => optional($music->user)->id ? (int) $music->user->id : null,
                    'album' => optional($music->album)->title ?? 'Inconnu',
                    'album_id' => optional($music->album)->id ? (int) $music->album->id : null,
                    'album_image' => $music->image ? asset('storage/' . $music->image) : null,
                    'audio' => $music->audio ? route('stream.music', ['filename' => $music->audio]) : null,
                    'duration' => $music->duration,
                    'dateAdded' => optional($music->pivot->created_at)->format('d/m/Y'),
                    'playlistIds' => $music->playlists->pluck('id'),
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|image',
        ]);

        $playlist = new Playlist([
            'title' => $request->input('title'),
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('playlists', 'public');
            $playlist->image = $path;
        }

        Auth::user()->playlists()->save($playlist);

        return response()->json([
            'message' => 'Playlist créée avec succès',
            'playlist' => [
                'id' => $playlist->id,
                'title' => $playlist->title,
                'image' => $playlist->image ? asset('storage/' . $playlist->image) : null,
            ],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $playlist = Playlist::findOrFail($id);

        if ((int) $playlist->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png',
        ]);

        $playlist->title = $request->input('title');

        if ($request->hasFile('image')) {
            if ($playlist->image) {
                Storage::disk('public')->delete($playlist->image);
            }
            $path = $request->file('image')->store('playlist_images', 'public');
            $playlist->image = $path;
        }

        $playlist->save();

        return response()->json([
            'message' => 'Playlist mise à jour avec succès',
            'playlist' => [
                'id' => $playlist->id,
                'title' => $playlist->title,
                'image' => $playlist->image ? asset('storage/' . $playlist->image) : null,
            ],
        ]);
    }

    public function destroy($id)
    {
        $playlist = Auth::user()->playlists()->findOrFail($id);
        $playlist->delete();

        return response()->json(['message' => 'Playlist supprimée']);
    }

    public function addMusic(Request $request, Playlist $playlist)
    {
        if ((int) $playlist->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $musicId = $request->input('music_id');
        $playlist->musics()->syncWithoutDetaching([$musicId]);

        return response()->json(['message' => 'Musique ajoutée']);
    }

    public function removeMusic(Request $request, Playlist $playlist)
    {
        if ((int) $playlist->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $musicId = $request->input('music_id');
        $playlist->musics()->detach($musicId);

        return response()->json(['message' => 'Musique retirée']);
    }

    public function like($id)
    {
        $pl = Playlist::findOrFail($id);
        $user = Auth::user();
        $user->likedPlaylists()->syncWithoutDetaching([$pl->id]);

        return response()->json(['status' => 'ok']);
    }

    public function unlike($id)
    {
        $pl = Playlist::findOrFail($id);
        $user = Auth::user();
        $user->likedPlaylists()->detach($pl->id);

        return response()->json(['status' => 'ok']);
    }
}
