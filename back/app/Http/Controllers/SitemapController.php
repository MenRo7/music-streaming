<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Playlist;
use App\Models\User;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic XML sitemap
     *
     * @return Response
     */
    public function index()
    {
        // Fetch all albums
        $albums = Album::select('id', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Fetch all public playlists
        $playlists = Playlist::select('id', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Fetch all users who have albums or music
        $artists = User::select('id')
            ->whereHas('albums')
            ->orWhereHas('musics')
            ->get();

        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

        return response()->view('sitemap', [
            'albums' => $albums,
            'playlists' => $playlists,
            'artists' => $artists,
            'frontendUrl' => $frontendUrl,
        ])->header('Content-Type', 'text/xml');
    }
}
