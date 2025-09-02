<?php

namespace App\Http\Controllers;

use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MusicController extends Controller
{
    public function index()
    {
        $musics = \App\Models\Music::with(['user', 'album'])->get()->map(function ($m) {
            return [
                'id' => $m->id,
                'name' => $m->title,
                'artist' => optional($m->user)->name ?? $m->artist_name,
                'album' => optional($m->album)->title ?? 'Inconnu',
                'album_image' => $m->image ? asset('storage/' . $m->image) : null,
                'audio' => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
            ];
        });

        return response()->json($musics);
    }

    public function show($id)
    {
        $music = \App\Models\Music::with(['user', 'album'])->find($id);

        if (!$music) {
            return response()->json(['message' => 'Musique non trouvée'], 404);
        }

        return response()->json([
            'id' => $music->id,
            'name' => $music->title,
            'artist' => optional($music->user)->name ?? $music->artist_name,
            'album' => optional($music->album)->title ?? 'Inconnu',
            'album_image' => $music->image ? asset('storage/' . $music->image) : null,
            'audio' => $music->audio ? route('stream.music', ['filename' => $music->audio]) : null,
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
            'music' => $music,
        ]);
    }

    public function myMusic()
    {
        $user = Auth::user();
        $musics = \App\Models\Music::where('user_id', $user->id)
        ->with(['user', 'playlists'])
        ->get();

        $musics->transform(function ($music) {
            $music->name   = $music->title;
            $music->artist = optional($music->user)->name ?? $music->artist_name;
            $music->audio = $music->audio ? route('stream.music', ['filename' => $music->audio]) : null;
            $music->album = optional($music->album)->title ?? 'Inconnu';
            $music->album_image = $music->image ? asset('storage/' . $music->image) : null;
            $music->playlistIds = $music->playlists->pluck('id');

            return $music;
        });

        return response()->json($musics);
    }
}
