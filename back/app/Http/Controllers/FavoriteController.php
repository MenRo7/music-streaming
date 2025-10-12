<?php

namespace App\Http\Controllers;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $favorites = $user->favorites()
            ->with([
                'user:id,name',
                'album:id,title,image',
                'playlists:id',
            ])
            ->withPivot('created_at')
            ->orderByDesc('favorites.created_at')
            ->get()
            ->map(function ($m) {
                $pivotCreatedAt = $m->pivot->created_at ?? null;
                $dateAdded = null;
                if ($pivotCreatedAt) {
                    $dateAdded = $pivotCreatedAt instanceof \DateTimeInterface
                        ? $pivotCreatedAt->format('d/m/Y')
                        : Carbon::parse($pivotCreatedAt)->format('d/m/Y');
                }

                return [
                    'id' => (int) $m->id,
                    'name' => $m->title,
                    'artist' => optional($m->user)->name ?? $m->artist_name,
                    'artist_user_id' => optional($m->user)->id ? (int) $m->user->id : null,
                    'album' => optional($m->album)->title ?? 'Inconnu',
                    'album_id' => optional($m->album)->id ? (int) $m->album->id : null,
                    'album_image' => $m->image
                        ? asset('storage/' . $m->image) . '?v=' . optional($m->updated_at)->timestamp
                        : null,
                    'audio' => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
                    'duration' => $m->duration,
                    'dateAdded' => $dateAdded,
                    'playlistIds' => $m->playlists
                        ->pluck('id')
                        ->map(fn ($id) => (int) $id)
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
