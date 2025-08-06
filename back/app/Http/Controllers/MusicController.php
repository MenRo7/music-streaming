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
        $musics = Music::all();
        return response()->json($musics);
    }

    public function show($id)
    {
        $music = Music::find($id);

        if (!$music) {
            return response()->json(['message' => 'Musique non trouvée'], 404);
        }

        return response()->json($music);
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
        $musics = Music::where('user_id', $user->id)->get();

        $musics->transform(function ($music) {
            $music->audio = $music->audio ? asset('storage/' . $music->audio) : null;
            $music->image = $music->image ? asset('storage/' . $music->image) : null;
            $music->playlist_ids = $music->playlists()->pluck('playlists.id'); // ✅ corrigé ici
            return $music;
        });

        return response()->json($musics);
    }
}
