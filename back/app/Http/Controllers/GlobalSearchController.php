<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Playlist;

use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'category' => 'nullable|in:user,playlist,all',
        ]);

        $query = $request->input('query');
        $category = $request->input('category', 'all');
        $perPage = $request->input('per_page', 10);

        $results = [];

        if ($category === 'user' || $category === 'all') {
            $users = User::where('name', 'like', '%' . $query . '%')
                ->select('id', 'name', 'profile_image')
                ->paginate($perPage, ['*'], 'users_page');
            
            $users->getCollection()->transform(function ($user) {
                $user->profile_image = $user->profile_image ? asset('storage/' . $user->profile_image) : null;
                return $user;
            });

            $results['users'] = $users;
        }

        if ($category === 'playlist' || $category === 'all') {
            $playlists = Playlist::where('title', 'like', '%' . $query . '%')
                ->select('id', 'title', 'image')
                ->paginate($perPage, ['*'], 'playlists_page');

            $playlists->getCollection()->transform(function ($playlist) {
                $playlist->image = $playlist->image ? asset('storage/' . $playlist->image) : null;
                return $playlist;
            });

            $results['playlists'] = $playlists;
        }

        return response()->json($results);
    }

}
