<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Playlist;
use App\Models\Music;
use App\Models\Album;

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
            'albums_page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
        ]);

        $query = $request->input('query');
        $categories = explode(',', $request->input('categories', 'user,playlist,music'));
        $perPage = $request->input('per_page', 10);
        $usersPage = $request->input('users_page', 1);
        $playlistsPage = $request->input('playlists_page', 1);
        $musicsPage = $request->input('musics_page', 1);
        $albumsPage = $request->input('albums_page', 1);

        $results = [];

        if (in_array('user', $categories)) {
            $users = User::where('name', 'like', '%' . $query . '%')
                ->select('id', 'name', 'profile_image')
                ->paginate($perPage, ['*'], 'users_page', $usersPage);

            $users->getCollection()->transform(function ($user) {
                $user->profile_image = $user->profile_image ? asset('storage/' . $user->profile_image) : null;
                return $user;
            });

            $results['users'] = ['data' => $users->items()];
        }

        if (in_array('playlist', $categories)) {
            $playlists = Playlist::where('title', 'like', '%' . $query . '%')
                ->select('id', 'title', 'image')
                ->paginate($perPage, ['*'], 'playlists_page', $playlistsPage);

            $playlists->getCollection()->transform(function ($playlist) {
                $playlist->image = $playlist->image ? asset('storage/' . $playlist->image) : null;
                return $playlist;
            });

            $results['playlists'] = ['data' => $playlists->items()];
        }

        if (in_array('music', $categories)) {
            $musics = Music::where('title', 'like', '%' . $query . '%')
                ->select('id', 'title', 'audio', 'image', 'artist_name')
                ->paginate($perPage, ['*'], 'musics_page', $musicsPage);

            $musics->getCollection()->transform(function ($music) {
                $music->audio = asset('storage/' . $music->audio);
                $music->image = $music->image ? asset('storage/' . $music->image) : null;
                return $music;
            });

            $results['musics'] = ['data' => $musics->items()];
        }

        if (in_array('album', $categories)) {
            $albums = Album::where('title', 'like', '%' . $query . '%')
                ->select('id', 'title', 'image')
                ->paginate($perPage, ['*'], 'albums_page', $albumsPage);

            $albums->getCollection()->transform(function ($album) {
                $album->image = $album->image ? asset('storage/' . $album->image) : null;
                return $album;
            });

            $results['albums'] = ['data' => $albums->items()];
        }

        return response()->json($results);
    }
}
