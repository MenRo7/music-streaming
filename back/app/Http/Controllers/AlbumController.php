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
                'image'       => $album->image
                    ? asset('storage/' . $album->image) . '?v=' . optional($album->updated_at)->timestamp
                    : null,
                'user_id'     => (int) $album->user_id,
                'artist_name' => $album->artist_name,
                'created_at'  => optional($album->created_at)?->format('d/m/Y'),
                'updated_at'  => optional($album->updated_at)?->toDateTimeString(),
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
            } elseif ($album->image) {
                // hériter de l'image d'album
                $music->image = $album->image;
            }

            $music->save();
        }

        return response()->json([
            'message' => 'Album et morceaux ajoutés avec succès',
            'album'   => $album,
        ]);
    }

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
                    'image'       => $album->image
                        ? asset('storage/' . $album->image) . '?v=' . optional($album->updated_at)->timestamp
                        : null,
                    'user_id'     => (int) $album->user_id,
                    'artist_name' => $album->artist_name,
                    'created_at'  => optional($album->created_at)?->format('d/m/Y'),
                    'updated_at'  => optional($album->updated_at)?->toDateTimeString(),
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
            if ($album->image && Storage::disk('public')->exists($album->image)) {
                Storage::disk('public')->delete($album->image);
            }
            $imagePath = $request->file('image')->store('album_images', 'public');
            $album->image = $imagePath;

            // propager l'image vers toutes les pistes
            foreach ($album->tracks as $music) {
                $music->image = $imagePath;
                $music->save();
            }
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
            $q->with(['playlists:id', 'favoredBy:id']);
        }])->find($id);

        if (!$album) {
            return response()->json(['message' => 'Album non trouvé'], 404);
        }

        if ((int) $album->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        DB::beginTransaction();
        try {
            $deletedTrackIds = [];

            if (method_exists($album, 'likedBy')) {
                $album->likedBy()->detach();
            }

            foreach ($album->tracks as $music) {
                $music->playlists()->detach();
                if (method_exists($music, 'favoredBy')) {
                    $music->favoredBy()->detach();
                }

                if ($music->audio && Storage::disk('public')->exists($music->audio)) {
                    Storage::disk('public')->delete($music->audio);
                }
                if ($music->image && Storage::disk('public')->exists($music->image)) {
                    Storage::disk('public')->delete($music->image);
                }

                $deletedTrackIds[] = (int) $music->id;
                $music->delete();
            }

            if ($album->image && Storage::disk('public')->exists($album->image)) {
                Storage::disk('public')->delete($album->image);
            }

            $albumId = (int) $album->id;
            $album->delete();

            DB::commit();

            return response()->json([
                'status'            => 'ok',
                'deleted_track_ids' => $deletedTrackIds,
                'deleted_album_id'  => $albumId,
            ]);
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

        $isLiked = (method_exists($album, 'likedBy') && Auth::check())
            ? $album->likedBy()->where('user_id', Auth::id())->exists()
            : false;

        return [
            'id'          => (int) $album->id,
            'title'       => $album->title,
            'type'        => $album->type,
            'image'       => $album->image
                ? asset('storage/' . $album->image) . '?v=' . optional($album->updated_at)->timestamp
                : null,
            'user_id'     => (int) $album->user_id,
            'artist_name' => optional($album->user)->name ?? $album->artist_name,
            'created_at'  => optional($album->created_at)?->format('d/m/Y'),
            'updated_at'  => optional($album->updated_at)?->toDateTimeString(),
            'musics'      => $musics,
            'is_liked'    => $isLiked,
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
            'image'        => $m->image
                ? asset('storage/' . $m->image) . '?v=' . optional($m->updated_at)->timestamp
                : null,
            'playlist_ids' => $m->playlists
                ->pluck('id')
                ->map(fn($id) => (int) $id)
                ->values()
                ->all(),
            'date_added'   => optional($m->created_at)?->format('d/m/Y'),
            'updated_at'   => optional($m->updated_at)?->toDateTimeString(),
        ];
    }

    public function like($id)
    {
        $album = Album::findOrFail($id);
        $user = Auth::user();
        $user->likedAlbums()->syncWithoutDetaching([$album->id]);
        return response()->json(['status' => 'ok']);
    }

    public function unlike($id)
    {
        $album = Album::findOrFail($id);
        $user = Auth::user();
        $user->likedAlbums()->detach($album->id);
        return response()->json(['status' => 'ok']);
    }
}
