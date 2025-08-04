<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Playlist;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'category' => 'nullable|in:user,playlist,music,all',
            'users_page' => 'integer|min:1',
            'playlists_page' => 'integer|min:1',
            'musics_page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
        ]);

        $query = $request->input('query');
        $categories = explode(',', $request->input('categories', 'user,playlist,music'));
        $perPage = $request->input('per_page', 10);
        $usersPage = $request->input('users_page', 1);
        $playlistsPage = $request->input('playlists_page', 1);
        $musicsPage = $request->input('musics_page', 1);

        $results = [];

        if (in_array('user', $categories)) {
            $users = User::where('name', 'like', '%' . $query . '%')
                ->select('id', 'name', 'profile_image')
                ->paginate($perPage, ['*'], 'users_page', $usersPage);

            $users->getCollection()->transform(function ($user) {
                $user->profile_image = $user->profile_image ? asset('storage/' . $user->profile_image) : null;
                return $user;
            });

            $results['users'] = $users;
        }

        if (in_array('playlist', $categories)) {
            $playlists = Playlist::where('title', 'like', '%' . $query . '%')
                ->select('id', 'title', 'image')
                ->paginate($perPage, ['*'], 'playlists_page', $playlistsPage);

            $playlists->getCollection()->transform(function ($playlist) {
                $playlist->image = $playlist->image ? asset('storage/' . $playlist->image) : null;
                return $playlist;
            });

            $results['playlists'] = $playlists;
        }

        if (in_array('music', $categories)) {
            $allTracks = collect();

            $limit = $perPage;
            $offset = ($musicsPage - 1) * $limit;

            try {
                $externalResponse = Http::get('https://freemusicapi.vercel.app/api/tracks', [
                    'q' => $query,
                ]);

                if ($externalResponse->successful()) {
                    $tracks = collect($externalResponse->json())->slice($offset, $limit);

                    $formattedTracks = $tracks->map(function ($track) {
                        return [
                            'id' => $track['id'] ?? uniqid(),
                            'name' => $track['title'] ?? 'Unknown Title',
                            'artist_name' => $track['artist'] ?? 'Unknown Artist',
                            'image' => $track['thumbnail'] ?? null,
                            'audio' => $track['audio_url'] ?? null,
                        ];
                    });

                    $allTracks = $allTracks->merge($formattedTracks);
                }
            } catch (\Exception $e) {
                \Log::error('FreeMusicAPI error: ' . $e->getMessage());
            }
            $results['musics'] = $allTracks->values();
        }

        return response()->json($results);
    }

}
