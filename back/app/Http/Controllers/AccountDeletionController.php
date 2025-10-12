<?php

namespace App\Http\Controllers;

use App\Models\AccountDeletionRequest;
use App\Models\Album;
use App\Models\Playlist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AccountDeletionController extends Controller
{
    public function requestDeletion(Request $request)
    {
        $user = $request->user();

        AccountDeletionRequest::where('user_id', $user->id)->delete();

        $token = Str::random(64);
        AccountDeletionRequest::create([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addHours(24),
        ]);

        $confirmUrl = route('account.delete.confirm', ['token' => $token]);

        try {
            Mail::raw(
                "Bonjour {$user->name},\n\n" .
                "Confirmez la suppression définitive de votre compte en cliquant sur ce lien :\n" .
                "{$confirmUrl}\n\n" .
                '⚠️ Cette action est irréversible. Le lien expire dans 24h.',
                fn ($m) => $m->to($user->email)->subject('Confirmez la suppression de votre compte')
            );
        } catch (\Throwable $e) {
            Log::error('Account deletion mail failed', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'E-mail non envoyé (config mail ?).',
                'confirm_url' => $confirmUrl,
            ], 200);
        }

        return response()->json([
            'message' => 'E-mail de confirmation envoyé. Vérifiez votre boîte mail.',
            'confirm_url' => app()->environment('local') ? $confirmUrl : null,
        ]);
    }

    public function confirmDeletion(string $token)
    {
        $req = AccountDeletionRequest::where('token', $token)
            ->where('expires_at', '>', now())
            ->first();

        if (! $req) {
            return response()->view('account.deletion_error', [
                'message' => 'Lien invalide ou expiré.',
            ], 400);
        }

        $user = User::find($req->user_id);
        if (! $user) {
            return response()->view('account.deletion_error', [
                'message' => 'Utilisateur introuvable.',
            ], 404);
        }

        $this->hardDeleteUser($user);

        $req->delete();

        return response()->view('account.deletion_success');
    }

    private function hardDeleteUser(User $user): void
    {
        DB::transaction(function () use ($user) {
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            Auth::logout();

            if (method_exists($user, 'following')) {
                $user->following()->detach();
            }
            if (method_exists($user, 'followers')) {
                $user->followers()->detach();
            }
            if (method_exists($user, 'likedPlaylists')) {
                $user->likedPlaylists()->detach();
            }
            if (method_exists($user, 'likedAlbums')) {
                $user->likedAlbums()->detach();
            }
            if (method_exists($user, 'favorites')) {
                $user->favorites()->detach();
            }

            $playlists = Playlist::where('user_id', $user->id)->get();
            foreach ($playlists as $pl) {
                $pl->musics()->detach();
                if ($pl->image && Storage::disk('public')->exists($pl->image)) {
                    Storage::disk('public')->delete($pl->image);
                }
                if (method_exists($pl, 'likedBy')) {
                    $pl->likedBy()->detach();
                }
                $pl->delete();
            }

            $albums = Album::with('tracks')->where('user_id', $user->id)->get();
            foreach ($albums as $album) {
                if (method_exists($album, 'likedBy')) {
                    $album->likedBy()->detach();
                }
                foreach ($album->tracks as $music) {
                    $this->deleteMusicRow($music);
                }
                $albumImage = $album->image;
                $album->delete();
                if ($albumImage && Storage::disk('public')->exists($albumImage)) {
                    $stillUsed = Album::where('image', $albumImage)->exists()
                        || \App\Models\Music::where('image', $albumImage)->exists();
                    if (! $stillUsed) {
                        Storage::disk('public')->delete($albumImage);
                    }
                }
            }

            $musics = \App\Models\Music::where('user_id', $user->id)->get();
            foreach ($musics as $m) {
                $this->deleteMusicRow($m);
            }

            if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $user->delete();
        });
    }

    private function deleteMusicRow(\App\Models\Music $music): void
    {
        $music->playlists()->detach();
        if (method_exists($music, 'favoredBy')) {
            $music->favoredBy()->detach();
        }

        $audio = $music->audio;
        $image = $music->image;
        $music->delete();

        if ($audio && Storage::disk('public')->exists($audio)) {
            Storage::disk('public')->delete($audio);
        }
        if ($image && Storage::disk('public')->exists($image)) {
            $stillUsed = \App\Models\Music::where('image', $image)->exists()
                || Album::where('image', $image)->exists();
            if (! $stillUsed) {
                Storage::disk('public')->delete($image);
            }
        }
    }
}
