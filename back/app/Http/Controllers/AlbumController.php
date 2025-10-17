<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AlbumController extends Controller
{
    public function index()
    {
        $albums = Auth::user()->albums->map(function ($album) {
            return [
                'id' => (int) $album->id,
                'title' => $album->title,
                'type' => $album->type,
                'image' => $this->publicUrl($album->image),
                'user_id' => (int) $album->user_id,
                'artist_name' => $album->artist_name,
                'created_at' => optional($album->created_at)?->format('d/m/Y'),
                'updated_at' => optional($album->updated_at)?->toDateTimeString(),
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

        if (! $album) {
            return response()->json(['message' => 'Album non trouvé'], 404);
        }

        return response()->json($this->formatAlbum($album));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:single,ep,album,compilation',
            'image' => 'nullable|image',
            'songs' => 'required|array|min:1',
            'songs.*.title' => 'required|string|max:255',
            'songs.*.audio' => 'required|mimes:mp3,wav,flac',
        ]);

        $user = Auth::user();

        $album = new Album;
        $album->title = $request->title;
        $album->type = $request->type;
        $album->artist_name = $user->name;
        $album->user_id = $user->id;

        if ($request->hasFile('image')) {
            $album->image = $this->storePublicFile($request->file('image'), 'album_images');
        }

        $album->save();

        foreach ($request->songs as $idx => $songData) {
            $music = new Music;
            $music->title = $songData['title'];
            $music->artist_name = $user->name;
            $music->user_id = $user->id;
            $music->album_id = $album->id;

            if (isset($songData['audio']) && $songData['audio'] instanceof UploadedFile) {
                $music->audio = $this->storePublicFile($songData['audio'], 'musics');
            } elseif ($request->hasFile("songs.$idx.audio")) {
                $music->audio = $this->storePublicFile($request->file("songs.$idx.audio"), 'musics');
            }

            if (isset($songData['image']) && $songData['image'] instanceof UploadedFile) {
                $music->image = $this->storePublicFile($songData['image'], 'music_images');
            } elseif ($request->hasFile("songs.$idx.image")) {
                $music->image = $this->storePublicFile($request->file("songs.$idx.image"), 'music_images');
            } elseif ($album->image) {
                $music->image = $album->image;
            }

            $music->save();
        }

        return response()->json([
            'message' => 'Album et morceaux ajoutés avec succès',
            'album' => [
                'id' => (int) $album->id,
                'title' => $album->title,
                'type' => $album->type,
                'image' => $this->publicUrl($album->image),
                'user_id' => (int) $album->user_id,
                'artist_name' => $album->artist_name,
            ],
        ]);
    }

    public function myAlbums()
    {
        $albums = Album::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($album) {
                return [
                    'id' => (int) $album->id,
                    'title' => $album->title,
                    'type' => $album->type,
                    'image' => $this->publicUrl($album->image),
                    'user_id' => (int) $album->user_id,
                    'artist_name' => $album->artist_name,
                    'created_at' => optional($album->created_at)?->format('d/m/Y'),
                    'updated_at' => optional($album->updated_at)?->toDateTimeString(),
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

        if (! $album) {
            return response()->json(['message' => 'Album non trouvé'], 404);
        }

        if ((int) $album->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        DB::transaction(function () use ($request, $album) {
            if ($request->filled('title')) {
                $album->title = $request->input('title');
            }

            if ($request->hasFile('image')) {
                $old = $album->image;
                $album->image = $this->storePublicFile($request->file('image'), 'album_images');
                $album->save();

                $album->load('tracks');
                foreach ($album->tracks as $music) {
                    $music->image = $album->image;
                    $music->save();
                }

                $this->deleteImageIfOrphan($old, null, $album->id);
            } else {
                $album->save();
            }
        });

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

        if (! $album) {
            return response()->json(['message' => 'Album non trouvé'], 404);
        }

        if ((int) $album->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        DB::beginTransaction();
        try {
            $deletedTrackIds = [];
            $albumImage = $album->image;

            if (method_exists($album, 'likedBy')) {
                $album->likedBy()->detach();
            }

            foreach ($album->tracks as $music) {
                $img = $music->image;
                $aud = $music->audio;
                $mid = (int) $music->id;
                $aid = $music->album_id;

                $music->playlists()->detach();
                if (method_exists($music, 'favoredBy')) {
                    $music->favoredBy()->detach();
                }

                $music->delete();

                if ($aud && Storage::disk('public')->exists($aud)) {
                    Storage::disk('public')->delete($aud);
                }
                $this->deleteImageIfOrphan($img, $mid, $aid);

                $deletedTrackIds[] = $mid;
            }

            $albumId = (int) $album->id;
            $album->delete();

            $this->deleteImageIfOrphan($albumImage, null, $albumId);

            DB::commit();

            return response()->json([
                'status' => 'ok',
                'deleted_track_ids' => $deletedTrackIds,
                'deleted_album_id' => $albumId,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erreur lors de la suppression de l’album.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function like($id)
    {
        $album = Album::findOrFail($id);
        $user = Auth::user();

        if (method_exists($user, 'likedAlbums')) {
            $user->likedAlbums()->syncWithoutDetaching([$album->id]);
        } elseif (method_exists($album, 'likedBy')) {
            $album->likedBy()->syncWithoutDetaching([Auth::id()]);
        } else {
            return response()->json(['message' => 'Relation de like non définie.'], 500);
        }

        return response()->json(['status' => 'ok']);
    }

    public function unlike($id)
    {
        $album = Album::findOrFail($id);
        $user = Auth::user();

        if (method_exists($user, 'likedAlbums')) {
            $user->likedAlbums()->detach($album->id);
        } elseif (method_exists($album, 'likedBy')) {
            $album->likedBy()->detach(Auth::id());
        } else {
            return response()->json(['message' => 'Relation de like non définie.'], 500);
        }

        return response()->json(['status' => 'ok']);
    }

    private function formatAlbum(Album $album): array
    {
        $musics = $album->tracks->map(fn ($m) => $this->formatTrack($m));

        $isLiked = (method_exists($album, 'likedBy') && Auth::check())
            ? $album->likedBy()->where('user_id', Auth::id())->exists()
            : false;

        return [
            'id' => (int) $album->id,
            'title' => $album->title,
            'type' => $album->type,
            'image' => $this->publicUrl($album->image),
            'user_id' => (int) $album->user_id,
            'artist_name' => optional($album->user)->name ?? $album->artist_name,
            'created_at' => optional($album->created_at)?->format('d/m/Y'),
            'updated_at' => optional($album->updated_at)?->toDateTimeString(),
            'musics' => $musics,
            'is_liked' => $isLiked,
        ];
    }

    private function formatTrack(Music $m): array
    {
        return [
            'id' => (int) $m->id,
            'title' => $m->title,
            'artist_name' => optional($m->user)->name ?? $m->artist_name,
            'artist_user_id' => $m->user_id ? (int) $m->user_id : null,
            'album_id' => $m->album_id ? (int) $m->album_id : null,
            'duration' => $m->duration,
            'audio' => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
            'image' => $this->publicUrl($m->image),
            'playlist_ids' => $m->playlists->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
            'date_added' => optional($m->created_at)?->format('d/m/Y'),
            'updated_at' => optional($m->updated_at)?->toDateTimeString(),
        ];
    }

    private function publicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        $clean = str_replace('\\', '/', $path);

        return asset('storage/' . ltrim($clean, '/'));
    }

    private function storePublicFile(UploadedFile $file, string $dir): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: '');
        if ($ext === '') {
            $mime = strtolower($file->getMimeType() ?: '');
            $ext = str_contains($mime, 'png') ? 'png'
                : (str_contains($mime, 'jpeg') || str_contains($mime, 'jpg') ? 'jpg'
                : (str_contains($mime, 'gif') ? 'gif'
                : (str_contains($mime, 'webp') ? 'webp'
                : (str_contains($mime, 'svg') ? 'svg'
                : (str_contains($mime, 'mp3') ? 'mp3'
                : (str_contains($mime, 'wav') ? 'wav'
                : (str_contains($mime, 'flac') ? 'flac' : 'bin')))))));
        }

        $basename = Str::random(40) . '.' . $ext;
        Storage::disk('public')->putFileAs($dir, $file, $basename);

        return $dir . '/' . $basename;
    }

    private function deleteImageIfOrphan(?string $path, ?int $ignoreMusicId = null, ?int $ignoreAlbumId = null): void
    {
        if (! $path) {
            return;
        }

        $stillUsedByMusic = Music::where('image', $path)
            ->when($ignoreMusicId, fn ($q) => $q->where('id', '!=', $ignoreMusicId))
            ->exists();

        $stillUsedByAlbum = Album::where('image', $path)
            ->when($ignoreAlbumId, fn ($q) => $q->where('id', '!=', $ignoreAlbumId))
            ->exists();

        if (! $stillUsedByMusic && ! $stillUsedByAlbum && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
