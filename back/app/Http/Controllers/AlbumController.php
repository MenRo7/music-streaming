<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class AlbumController extends Controller
{
    public function show($id)
    {
        try {
            $response = Http::get('https://api.jamendo.com/v3.0/albums/tracks', [
                'client_id' => env('JAMENDO_CLIENT_ID'),
                'format' => 'json',
                'id' => $id,
            ]);

            if ($response->successful()) {
                $data = $response->json()['results'][0] ?? null;

                if (!$data) {
                    return response()->json(['error' => 'Album not found'], 404);
                }

                $album = [
                    'id' => $data['id'],
                    'title' => $data['name'],
                    'image' => $data['image'],
                    'artist_name' => $data['artist_name'],
                    'songs' => collect($data['tracks'])->map(function ($track) use ($data) {
                        return [
                            'id' => $track['id'],
                            'name' => $track['name'],
                            'duration' => gmdate("i:s", $track['duration']),
                            'audio' => $track['audio'],
                            'artist' => $data['artist_name'],
                            'album_image' => $data['image'],
                            'album' => $data['name'],
                            'dateAdded' => now()->toDateString(),
                        ];
                    }),
                ];

                return response()->json($album);
            }

            return response()->json(['error' => 'Failed to fetch album'], 500);
        } catch (\Exception $e) {
            \Log::error('Album fetch error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Exception while fetching album',
                'exception' => $e->getMessage(),
            ], 500);
        }
    }
}
