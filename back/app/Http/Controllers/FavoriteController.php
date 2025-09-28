<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $favorites = $user->favorites()
            ->with(['user:id,name', 'album:id,title', 'playlists:id'])
            ->orderByDesc('favorites.created_at')
            ->get()
            ->map(function ($m) {
                return [
                    'id'           => (int) $m->id,
                    'name'         => $m->title,
                    'artist'       => optional($m->user)->name ?? $m->artist_name,
                    'album'        => optional($m->album)->title ?? 'Inconnu',
                    'album_image'  => $m->image
                        ? asset('storage/' . $m->image) . '?v=' . optional($m->updated_at)->timestamp
                        : null,
                    'audio'        => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
                    'duration'     => $m->duration,
                    'date_added'   => optional($m->pivot->created_at)?->toDateString(), // date d'ajout en favori
                    'playlist_ids' => $m->playlists
                        ->pluck('id')
                        ->map(fn($id) => (int) $id)
                        ->values()
                        ->all(),
                ];
            });

        return response()->json($favorites);
    }

    public function store(\App\Models\Music $music)
    {
        $user = Auth::user();
        $user->favorites()->syncWithoutDetaching([$music->id]);
        return response()->json(['status' => 'ok']);
    }

    public function destroy(\App\Models\Music $music)
    {
        $user = Auth::user();
        $user->favorites()->detach($music->id);
        return response()->json(['status' => 'ok']);
    }
}
