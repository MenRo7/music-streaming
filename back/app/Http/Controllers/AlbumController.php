<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AlbumController extends Controller
{
    public function index()
    {
        $albums = Auth::user()->albums->map(function ($album) {
            return [
                'id'          => (int) $album->id,
                'title'       => $album->title,
                'type'        => $album->type,
                'image'       => $album->image ? asset('storage/' . $album->image) : null,
                'user_id'     => (int) $album->user_id,
                'artist_name' => $album->artist_name,
                'created_at'  => $album->created_at,
            ];
        });

        return response()->json($albums);
    }

    public function show($id)
    {
        $album = Album::with([
            'user:id,name',
            'tracks' => function ($q) {
                $q->with(['user:id,name', 'playlists:id']);
            },
        ])->find($id);

        if (!$album) {
            return response()->json(['message' => 'Album non trouvé'], 404);
        }

        return response()->json($this->formatAlbum($album));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'           => 'required|string|max:255',
            'type'            => 'required|in:single,ep,album,compilation',
            'image'           => 'nullable|image',
            'songs'           => 'required|array|min:1',
            'songs.*.title'   => 'required|string|max:255',
            'songs.*.audio'   => 'required|mimes:mp3,wav,flac',
        ]);

        $user = Auth::user();

        $album = new Album();
        $album->title = $request->title;
        $album->type = $request->type;
        $album->artist_name = $user->name;
        $album->user_id = $user->id;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('album_images', 'public');
            $album->image = $imagePath;
        }

        $album->save();

        foreach ($request->songs as $songData) {
            $music = new Music();
            $music->title = $songData['title'];
            $music->artist_name = $user->name;
            $music->user_id = $user->id;
            $music->album_id = $album->id;

            if (isset($songData['audio'])) {
                $audioPath = Storage::disk('public')->put('musics', $songData['audio']);
                $music->audio = $audioPath;
            }

            if (isset($songData['image'])) {
                $imagePath = Storage::disk('public')->put('music_images', $songData['image']);
                $music->image = $imagePath;
            }

            $music->save();
        }

        return response()->json([
            'message' => 'Album et morceaux ajoutés avec succès',
            'album'   => $album,
        ]);
    }

    /**
     * Liste des albums de l'utilisateur connecté.
     */
    public function myAlbums()
    {
        $user = Auth::user();

        $albums = Album::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($album) {
                return [
                    'id'          => (int) $album->id,
                    'title'       => $album->title,
                    'type'        => $album->type,
                    'image'       => $album->image ? asset('storage/' . $album->image) : null,
                    'user_id'     => (int) $album->user_id,
                    'artist_name' => $album->artist_name,
                    'created_at'  => $album->created_at,
                ];
            });

        return response()->json($albums);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'image' => 'sometimes|nullable|image',
        ]);

        $album = Album::with(['user:id,name', 'tracks' => function ($q) {
            $q->with(['user:id,name', 'playlists:id']);
        }])->find($id);

        if (!$album) {
            return response()->json(['message' => 'Album non trouvé'], 404);
        }

        if ((int) $album->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($request->filled('title')) {
            $album->title = $request->input('title');
        }

        if ($request->hasFile('image')) {
            if ($album->image) {
                Storage::disk('public')->delete($album->image);
            }
            $imagePath = $request->file('image')->store('album_images', 'public');
            $album->image = $imagePath;
        }

        $album->save();

        $album->load(['user:id,name', 'tracks' => function ($q) {
            $q->with(['user:id,name', 'playlists:id']);
        }]);

        return response()->json($this->formatAlbum($album));
    }

    public function destroy($id)
    {
        $album = Album::with(['tracks' => function ($q) {
            $q->with(['playlists:id', 'favoredBy:id']); // pour éviter N+1 sur détachements
        }])->find($id);

        if (!$album) {
            return response()->json(['message' => 'Album non trouvé'], 404);
        }

        if ((int) $album->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        DB::beginTransaction();
        try {
            // Supprimer TOUTES les musiques de l'album (fichiers + détachements)
            foreach ($album->tracks as $music) {
                // détacher des playlists
                $music->playlists()->detach();

                // détacher des favoris
                if (method_exists($music, 'favoredBy')) {
                    $music->favoredBy()->detach();
                }

                // supprimer les fichiers
                if ($music->audio && Storage::disk('public')->exists($music->audio)) {
                    Storage::disk('public')->delete($music->audio);
                }
                if ($music->image && Storage::disk('public')->exists($music->image)) {
                    Storage::disk('public')->delete($music->image);
                }

                // supprimer la musique
                $music->delete();
            }

            // supprimer l'image de l'album si présente
            if ($album->image && Storage::disk('public')->exists($album->image)) {
                Storage::disk('public')->delete($album->image);
            }

            // supprimer l'album
            $album->delete();

            DB::commit();
            return response()->json(['status' => 'ok']);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression de l’album.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    private function formatAlbum(Album $album): array
    {
        $musics = $album->tracks->map(fn ($m) => $this->formatTrack($m));

        return [
            'id'          => (int) $album->id,
            'title'       => $album->title,
            'type'        => $album->type,
            'image'       => $album->image ? asset('storage/' . $album->image) : null,
            'user_id'     => (int) $album->user_id,
            'artist_name' => optional($album->user)->name ?? $album->artist_name,
            'created_at'  => optional($album->created_at)?->toDateString(),
            'musics'      => $musics,
        ];
    }

    private function formatTrack(Music $m): array
    {
        return [
            'id'           => (int) $m->id,
            'title'        => $m->title,
            'artist_name'  => optional($m->user)->name ?? $m->artist_name,
            'duration'     => $m->duration,
            'audio'        => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
            'image'        => $m->image ? asset('storage/' . $m->image) : null,
            'playlist_ids' => $m->playlists
                ->pluck('id')
                ->map(fn($id) => (int) $id)
                ->values()
                ->all(),
        ];
    }
}
