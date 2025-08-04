<?php

namespace App\Http\Controllers;

use App\Models\Music;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MusicController extends Controller
{
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

}
