<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class FavoriteController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $favorites = $user->favorites()
            ->with(['user:id,name', 'album:id,title', 'playlists:id'])
            // ✅ s’assurer que le pivot created_at est présent
            ->withPivot('created_at')
            // ✅ l’ordre par la colonne de la table pivot
            ->orderByDesc('favorites.created_at')
            ->get()
            ->map(function ($m) {
                // created_at peut être Carbon OU une string selon le contexte
                $pivotCreatedAt = $m->pivot->created_at ?? null;
                $dateAdded = null;
                if ($pivotCreatedAt) {
                    $dateAdded = $pivotCreatedAt instanceof \DateTimeInterface
                        ? $pivotCreatedAt->format('d/m/Y')
                        : Carbon::parse($pivotCreatedAt)->format('d/m/Y');
                }

                return [
                    'id'          => (int) $m->id,
                    'name'        => $m->title,
                    'artist'      => optional($m->user)->name ?? $m->artist_name,
                    'album'       => optional($m->album)->title ?? 'Inconnu',
                    'album_image' => $m->image
                        ? asset('storage/' . $m->image) . '?v=' . optional($m->updated_at)->timestamp
                        : null,
                    'audio'       => $m->audio ? route('stream.music', ['filename' => $m->audio]) : null,
                    'duration'    => $m->duration,

                    // ✅ clé alignée avec le front + format identique aux autres pages
                    'dateAdded'   => $dateAdded,

                    // ✅ même nommage que le front
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
