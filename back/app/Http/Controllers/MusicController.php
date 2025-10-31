<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MusicController extends Controller
{
    public function index()
    {
        $musics = Music::with(['user:id,name', 'album:id,title', 'playlists:id'])
            ->get()
            ->map(function ($m) {
                return [
                    'id' => (int) $m->id,
                    'name' => $m->title,
                    'artist' => optional($m->user)->name ?? $m->artist_name,
                    'album' => optional($m->album)->title ?? 'Inconnu',
                    'album_image' => $this->publicUrl($m->image),
                    'audio' => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
                    'duration' => $m->duration,
                    'playlist_ids' => $m->playlists->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
                    'album_id' => $m->album_id ? (int) $m->album_id : null,
                    'artist_user_id' => $m->user_id ? (int) $m->user_id : null,
                ];
            });

        return response()->json($musics);
    }

    public function show($id)
    {
        $m = Music::with(['user:id,name', 'album:id,title', 'playlists:id'])->find($id);

        if (! $m) {
            return response()->json(['message' => 'Musique non trouvée'], 404);
        }

        return response()->json([
            'id' => (int) $m->id,
            'name' => $m->title,
            'artist' => optional($m->user)->name ?? $m->artist_name,
            'album' => optional($m->album)->title ?? 'Inconnu',
            'album_image' => $this->publicUrl($m->image),
            'audio' => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
            'duration' => $m->duration,
            'playlist_ids' => $m->playlists->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
            'album_id' => $m->album_id ? (int) $m->album_id : null,
            'artist_user_id' => $m->user_id ? (int) $m->user_id : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'audio' => 'required|file|mimes:mp3,wav,flac',
            'image' => 'sometimes|nullable|image',
            'album_id' => 'sometimes|nullable|integer|exists:albums,id',
            'duration' => 'sometimes|nullable|integer|min:0',
        ]);

        $user = Auth::user();
        $album = $request->filled('album_id') ? Album::find($request->integer('album_id')) : null;

        $music = new Music;
        $music->title = $request->string('title');
        $music->artist_name = $user->name;
        $music->user_id = $user->id;
        if ($album) {
            $music->album_id = $album->id;
        }

        // Set duration from request if provided
        if ($request->filled('duration')) {
            $music->duration = $request->integer('duration');
        }

        if ($request->hasFile('audio')) {
            $music->audio = $this->storePublicFile($request->file('audio'), 'musics');

            // Only calculate duration server-side if not provided by frontend
            if (!$request->filled('duration')) {
                $audioPath = Storage::disk('public')->path($music->audio);
                $duration = $this->getAudioDuration($audioPath);
                if ($duration !== null) {
                    $music->duration = $duration;
                }
            }
        }

        if ($request->hasFile('image')) {
            $music->image = $this->storePublicFile($request->file('image'), 'music_images');
        } elseif ($album && $album->image) {
            $music->image = $album->image;
        }

        $music->save();

        return response()->json([
            'message' => 'Musique ajoutée avec succès',
            'music' => [
                'id' => (int) $music->id,
                'name' => $music->title,
                'artist' => $music->artist_name,
                'album_id' => $music->album_id ? (int) $music->album_id : null,
                'album_image' => $this->publicUrl($music->image),
                'audio' => $music->audio ? route('stream.music', ['filename' => $music->audio]) : null,
            ],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'audio' => 'sometimes|file|mimes:mp3,wav,flac',
            'image' => 'sometimes|nullable|image',
        ]);

        $music = Music::with(['playlists:id', 'favoredBy:id', 'album:id,image'])->find($id);
        if (! $music) {
            return response()->json(['message' => 'Musique non trouvée'], 404);
        }
        if ((int) $music->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($request->filled('title')) {
            $music->title = $request->string('title');
        }

        if ($request->hasFile('audio')) {
            if ($music->audio && Storage::disk('public')->exists($music->audio)) {
                Storage::disk('public')->delete($music->audio);
            }
            $music->audio = $this->storePublicFile($request->file('audio'), 'musics');

            // Recalculate duration
            $audioPath = Storage::disk('public')->path($music->audio);
            $duration = $this->getAudioDuration($audioPath);
            if ($duration !== null) {
                $music->duration = $duration;
            }
        }

        if ($request->hasFile('image')) {
            $old = $music->image;
            $music->image = $this->storePublicFile($request->file('image'), 'music_images');
            $music->save();
            $this->deleteImageIfOrphan($old, $music->id, $music->album_id);
        } else {
            $music->save();
        }

        return response()->json([
            'message' => 'Musique mise à jour',
            'music' => [
                'id' => (int) $music->id,
                'name' => $music->title,
                'artist' => $music->artist_name,
                'album_id' => $music->album_id ? (int) $music->album_id : null,
                'album_image' => $this->publicUrl($music->image),
                'audio' => $music->audio ? route('stream.music', ['filename' => $music->audio]) : null,
            ],
        ]);
    }

    public function destroy($id)
    {
        $music = Music::with(['playlists:id', 'favoredBy:id'])->find($id);

        if (! $music) {
            return response()->json(['message' => 'Musique non trouvée'], 404);
        }
        if ((int) $music->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $music->playlists()->detach();
        if (method_exists($music, 'favoredBy')) {
            $music->favoredBy()->detach();
        }

        $oldAudio = $music->audio;
        $oldImage = $music->image;
        $albumId = $music->album_id;
        $deletedId = (int) $music->id;

        $music->delete();

        if ($oldAudio && Storage::disk('public')->exists($oldAudio)) {
            Storage::disk('public')->delete($oldAudio);
        }
        $this->deleteImageIfOrphan($oldImage, $deletedId, $albumId);

        return response()->json([
            'status' => 'ok',
            'deleted_track_ids' => [$deletedId],
        ]);
    }

    public function myMusic()
    {
        $musics = Music::where('user_id', Auth::id())
            ->with(['user:id,name', 'album:id,title', 'playlists:id'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($m) {
                return [
                    'id' => (int) $m->id,
                    'name' => $m->title,
                    'artist' => optional($m->user)->name ?? $m->artist_name,
                    'album' => optional($m->album)->title ?? 'Inconnu',
                    'album_image' => $this->publicUrl($m->image),
                    'audio' => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
                    'duration' => $m->duration,
                    'date_added' => optional($m->created_at)?->toDateString(),
                    'playlist_ids' => $m->playlists->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
                    'album_id' => $m->album_id ? (int) $m->album_id : null,
                    'artist_user_id' => $m->user_id ? (int) $m->user_id : null,
                ];
            });

        return response()->json($musics);
    }

    public function exists(Request $request)
    {
        $ids = collect($request->input('ids', []))
            ->map(fn ($v) => (int) $v)
            ->filter(fn ($v) => $v > 0)
            ->unique()
            ->values()
            ->all();

        if (empty($ids)) {
            return response()->json(['exists' => []]);
        }

        $exists = Music::whereIn('id', $ids)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        return response()->json(['exists' => $exists]);
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

    private function getAudioDuration(string $filePath): ?int
    {
        try {
            $getID3 = new \getID3;
            $fileInfo = $getID3->analyze($filePath);

            if (isset($fileInfo['playtime_seconds'])) {
                return (int) round($fileInfo['playtime_seconds']);
            }

            return null;
        } catch (\Exception $e) {
            \Log::warning('Failed to get audio duration: ' . $e->getMessage());

            return null;
        }
    }
}
