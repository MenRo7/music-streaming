<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class AlbumController extends Controller
{
    public function show($id)
    {
        try {
            $album = Album::find($id);

            if (!$album) {
                return response()->json(['error' => 'Album not found'], 404);
            }

            $songs = $album->tracks()->get();

            $albumData = [
                'id' => $album->id,
                'title' => $album->title,
                'image' => $album->image,
                'artist_name' => $album->artist_name,
                'songs' => $songs->map(function ($track) {
                    return [
                        'id' => $track->id,
                        'name' => $track->name,
                        'duration' => gmdate("i:s", $track->duration),
                        'audio' => asset('storage/' . $track->audio),
                        'artist' => $track->artist_name,
                        'album_image' => asset('storage/' . $track->album_image),
                        'album' => $track->album_name,
                    ];
                }),
            ];

            return response()->json($albumData);
        } catch (\Exception $e) {
            \Log::error('Album fetch error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Exception while fetching album',
                'exception' => $e->getMessage(),
            ], 500);
        }
    }
}
