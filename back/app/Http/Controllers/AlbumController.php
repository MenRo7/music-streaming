<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AlbumController extends Controller
{
    public function index()
    {
        $albums = Auth::user()->albums->map(function ($album) {
        return [
            'id' => $album->id,
            'title' => $album->title,
            'type' => $album->type,
            'image' => $album->image ? asset('storage/' . $album->image) : null,
            'user_id' => $album->user_id,
            'artist_name' => $album->artist_name,
            'created_at' => $album->created_at,
        ];
    });

        return response()->json($albums);
    }

    public function show($id)
    {
        $album = Album::find($id);

        if (!$album) {
            return response()->json(['message' => 'Album non trouvé'], 404);
        }

        return response()->json([
            'id' => $album->id,
            'title' => $album->title,
            'type' => $album->type,
            'image' => $album->image ? asset('storage/' . $album->image) : null,
            'user_id' => $album->user_id,
            'artist_name' => $album->artist_name,
            'created_at' => $album->created_at,
        ]);
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
            'album' => $album,
        ]);
    }

    public function myAlbums()
    {
        $user = Auth::user();
        $albums = Album::where('user_id', $user->id)->get();

        $formattedAlbums = $albums->map(function ($album) {
            return [
                'id' => $album->id,
                'title' => $album->title,
                'type' => $album->type,
                'image' => $album->image ? asset('storage/' . $album->image) : null,
                'user_id' => $album->user_id,
                'artist_name' => $album->artist_name,
                'created_at' => $album->created_at,
            ];
        });

        return response()->json($formattedAlbums);
    }
}


