<?php

namespace App\Http\Controllers;

use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MusicController extends Controller
{
    public function index()
    {
        $musics = Music::with(['user:id,name', 'album:id,title', 'playlists:id'])
            ->get()
            ->map(function ($m) {
                return [
                    'id'           => (int) $m->id,
                    'name'         => $m->title,
                    'artist'       => optional($m->user)->name ?? $m->artist_name,
                    'album'        => optional($m->album)->title ?? 'Inconnu',
                    'album_image'  => $m->image
                        ? asset('storage/' . $m->image) . '?v=' . optional($m->updated_at)->timestamp
                        : null,
                    'audio'        => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
                    'playlist_ids' => $m->playlists->pluck('id')->map(fn($id)=>(int)$id)->values()->all(),
                ];
            });

        return response()->json($musics);
    }

    public function show($id)
    {
        $music = Music::with(['user:id,name', 'album:id,title', 'playlists:id'])->find($id);

        if (!$music) {
            return response()->json(['message' => 'Musique non trouvée'], 404);
        }

        return response()->json([
            'id'           => (int) $music->id,
            'name'         => $music->title,
            'artist'       => optional($music->user)->name ?? $music->artist_name,
            'album'        => optional($music->album)->title ?? 'Inconnu',
            'album_image'  => $music->image
                ? asset('storage/' . $music->image) . '?v=' . optional($music->updated_at)->timestamp
                : null,
            'audio'        => $music->audio ? route('stream.music', ['filename' => $music->audio]) : null,
            'playlist_ids' => $music->playlists->pluck('id')->map(fn($id)=>(int)$id)->values()->all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'audio' => 'required|mimes:mp3,wav,flac',
            'image' => 'nullable|image',
        ]);

        $user = Auth::user();

        $music = new Music();
        $music->title = $request->title;
        $music->artist_name = $user->name;
        $music->user_id = $user->id;

        if ($request->hasFile('audio')) {
            $audioPath = $request->file('audio')->store('musics', 'public');
            $music->audio = $audioPath;
        }

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('music_images', 'public');
            $music->image = $imagePath;
        }

        $music->save();

        return response()->json([
            'message' => 'Musique ajoutée avec succès',
            'music'   => $music,
        ]);
    }

    public function myMusic()
    {
        $user = Auth::user();

        $musics = Music::where('user_id', $user->id)
            ->with(['user:id,name', 'album:id,title', 'playlists:id'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($m) {
                return [
                    'id'           => (int) $m->id,
                    'name'         => $m->title,
                    'artist'       => optional($m->user)->name ?? $m->artist_name,
                    'album'        => optional($m->album)->title ?? 'Inconnu',
                    'album_image'  => $m->image
                        ? asset('storage/' . $m->image) . '?v=' . optional($m->updated_at)->timestamp
                        : null,
                    'audio'        => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
                    'duration'     => $m->duration,
                    'date_added'   => optional($m->created_at)?->toDateString(),
                    'playlist_ids' => $m->playlists
                        ->pluck('id')
                        ->map(fn($id) => (int) $id)
                        ->values()
                        ->all(),
                ];
            });

        return response()->json($musics);
    }
}
