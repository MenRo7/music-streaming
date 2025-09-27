<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Music;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $musics = $user->favorites()
            ->with(['user:id,name', 'playlists:id'])
            ->latest('favorites.created_at')
            ->get()
            ->map(function (Music $m) {
                return [
                    'id'           => (int) $m->id,
                    'title'        => $m->title,
                    'artist_name'  => optional($m->user)->name ?? $m->artist_name,
                    'duration'     => $m->duration, // string "MM:SS" si dispo
                    'image'        => $m->image ? asset('storage/' . $m->image) : null,
                    'audio'        => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
                    'playlist_ids' => $m->playlists->pluck('id')->map(fn($id) => (int) $id)->values(),
                    'date_added'   => optional($m->pivot?->created_at)?->toDateString(),

                ];
            });

        return response()->json(['songs' => $musics]);
    }

    public function store(Request $request, Music $music)
    {
        $user = $request->user();
        $user->favorites()->syncWithoutDetaching([$music->id]);
        return response()->json(['status' => 'ok']);
    }

    public function destroy(Request $request, Music $music)
    {
        $user = $request->user();
        $user->favorites()->detach($music->id);
        return response()->json(['status' => 'ok']);
    }
}
