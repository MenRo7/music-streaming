<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Music;
use App\Models\Album;
use App\Models\Playlist;
use App\Models\Donation;

class DataExportController extends Controller
{
    /**
     * Export all user data in JSON format (GDPR Article 20 - Right to data portability)
     */
    public function exportData(Request $request)
    {
        $user = Auth::user();

        // Collect all user data
        $data = [
            'export_date' => now()->toIso8601String(),
            'export_format' => 'JSON',
            'gdpr_article' => 'Article 20 - Right to data portability',

            // Personal Information
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'date_of_birth' => optional($user->date_of_birth)->toDateString(),
                'age' => $user->age ?? null,
                'profile_image' => $user->profile_image,
                'locale' => $user->locale,
                'email_verified_at' => optional($user->email_verified_at)->toIso8601String(),
                'created_at' => optional($user->created_at)->toIso8601String(),
                'updated_at' => optional($user->updated_at)->toIso8601String(),
            ],

            // Payment Information
            'payment_info' => [
                'stripe_connect_id' => $user->stripe_connect_id,
                'payments_enabled' => (bool) $user->payments_enabled,
                'stripe_onboarding_completed' => !empty($user->stripe_connect_id) && $user->payments_enabled,
            ],

            // Music Uploads
            'uploaded_music' => Music::where('user_id', $user->id)
                ->get()
                ->map(function ($music) {
                    return [
                        'id' => $music->id,
                        'title' => $music->title,
                        'artist_name' => $music->artist_name,
                        'duration' => $music->duration,
                        'audio_filename' => $music->audio,
                        'image_filename' => $music->image,
                        'album_id' => $music->album_id,
                        'created_at' => optional($music->created_at)->toIso8601String(),
                        'updated_at' => optional($music->updated_at)->toIso8601String(),
                    ];
                }),

            // Albums
            'albums' => Album::where('user_id', $user->id)
                ->with('tracks')
                ->get()
                ->map(function ($album) {
                    return [
                        'id' => $album->id,
                        'title' => $album->title,
                        'artist_name' => $album->artist_name,
                        'type' => $album->type,
                        'image_filename' => $album->image,
                        'created_at' => optional($album->created_at)->toIso8601String(),
                        'updated_at' => optional($album->updated_at)->toIso8601String(),
                        'tracks_count' => $album->tracks->count(),
                        'track_ids' => $album->tracks->pluck('id')->toArray(),
                    ];
                }),

            // Playlists
            'playlists' => Playlist::where('user_id', $user->id)
                ->with('musics')
                ->get()
                ->map(function ($playlist) {
                    return [
                        'id' => $playlist->id,
                        'title' => $playlist->title,
                        'image_filename' => $playlist->image,
                        'created_at' => optional($playlist->created_at)->toIso8601String(),
                        'updated_at' => optional($playlist->updated_at)->toIso8601String(),
                        'tracks_count' => $playlist->musics->count(),
                        'track_ids' => $playlist->musics->pluck('id')->toArray(),
                    ];
                }),

            // Favorites
            'favorites' => $user->favorites()
                ->get()
                ->map(function ($music) {
                    return [
                        'music_id' => $music->id,
                        'title' => $music->title,
                        'artist_name' => $music->artist_name,
                        'favorited_at' => optional($music->pivot->created_at)->toIso8601String(),
                    ];
                }),

            // Liked Albums
            'liked_albums' => $user->likedAlbums()
                ->get()
                ->map(function ($album) {
                    return [
                        'album_id' => $album->id,
                        'title' => $album->title,
                        'artist_name' => $album->artist_name,
                        'liked_at' => optional($album->pivot->created_at)->toIso8601String(),
                    ];
                }),

            // Liked Playlists
            'liked_playlists' => $user->likedPlaylists()
                ->get()
                ->map(function ($playlist) {
                    return [
                        'playlist_id' => $playlist->id,
                        'title' => $playlist->title,
                        'liked_at' => optional($playlist->pivot->created_at)->toIso8601String(),
                    ];
                }),

            // Following (Subscriptions)
            'following' => $user->following()
                ->get()
                ->map(function ($followedUser) {
                    return [
                        'user_id' => $followedUser->id,
                        'name' => $followedUser->name,
                        'followed_at' => optional($followedUser->pivot->created_at)->toIso8601String(),
                    ];
                }),

            // Followers
            'followers' => $user->followers()
                ->get()
                ->map(function ($follower) {
                    return [
                        'user_id' => $follower->id,
                        'name' => $follower->name,
                        'followed_at' => optional($follower->pivot->created_at)->toIso8601String(),
                    ];
                }),

            // Donations Made
            'donations_made' => Donation::where('from_user_id', $user->id)
                ->with('recipient:id,name')
                ->get()
                ->map(function ($donation) {
                    return [
                        'id' => $donation->id,
                        'recipient_name' => optional($donation->recipient)->name,
                        'recipient_id' => $donation->to_user_id,
                        'amount' => $donation->amount,
                        'currency' => $donation->currency,
                        'status' => $donation->status,
                        'stripe_payment_intent_id' => $donation->stripe_payment_intent_id,
                        'created_at' => optional($donation->created_at)->toIso8601String(),
                    ];
                }),

            // Donations Received
            'donations_received' => Donation::where('to_user_id', $user->id)
                ->with('donor:id,name')
                ->get()
                ->map(function ($donation) {
                    return [
                        'id' => $donation->id,
                        'donor_name' => optional($donation->donor)->name,
                        'donor_id' => $donation->from_user_id,
                        'amount' => $donation->amount,
                        'currency' => $donation->currency,
                        'status' => $donation->status,
                        'stripe_payment_intent_id' => $donation->stripe_payment_intent_id,
                        'created_at' => optional($donation->created_at)->toIso8601String(),
                    ];
                }),

            // Statistics
            'statistics' => [
                'total_music_uploads' => Music::where('user_id', $user->id)->count(),
                'total_albums' => Album::where('user_id', $user->id)->count(),
                'total_playlists' => Playlist::where('user_id', $user->id)->count(),
                'total_favorites' => $user->favorites()->count(),
                'total_liked_albums' => $user->likedAlbums()->count(),
                'total_liked_playlists' => $user->likedPlaylists()->count(),
                'total_following' => $user->following()->count(),
                'total_followers' => $user->followers()->count(),
                'total_donations_made' => Donation::where('from_user_id', $user->id)->count(),
                'total_donations_received' => Donation::where('to_user_id', $user->id)->count(),
                'account_age_days' => optional($user->created_at)->diffInDays(now()),
            ],

            // Metadata
            'metadata' => [
                'note' => 'This export contains all your personal data stored in Rhapsody, in compliance with GDPR Article 20 (Right to data portability).',
                'file_references' => 'Audio and image filenames are provided for reference. Actual files are stored on our servers.',
                'data_retention' => 'This data is retained as long as your account exists. You can delete your account at any time from Preferences.',
                'contact' => 'For questions about your data, contact privacy@rhapsody.com',
            ],
        ];

        // Generate filename with timestamp
        $filename = 'rhapsody_data_export_' . $user->id . '_' . now()->format('Y-m-d_His') . '.json';

        // Return JSON with download headers
        return response()->json($data, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Show a summary of all user data (GDPR Article 15 - Right of access)
     */
    public function showDataSummary(Request $request)
    {
        $user = Auth::user();

        return response()->json([
            'personal_information' => [
                'name' => $user->name,
                'email' => $user->email,
                'date_of_birth' => optional($user->date_of_birth)->toDateString(),
                'profile_image' => $user->profile_image ? 'Yes' : 'No',
                'locale' => $user->locale ?? 'Not set',
                'account_created' => optional($user->created_at)->format('d/m/Y H:i'),
                'email_verified' => $user->email_verified_at ? 'Yes' : 'No',
            ],
            'content_statistics' => [
                'uploaded_tracks' => Music::where('user_id', $user->id)->count(),
                'created_albums' => Album::where('user_id', $user->id)->count(),
                'created_playlists' => Playlist::where('user_id', $user->id)->count(),
                'favorite_tracks' => $user->favorites()->count(),
                'liked_albums' => $user->likedAlbums()->count(),
                'liked_playlists' => $user->likedPlaylists()->count(),
            ],
            'social' => [
                'following' => $user->following()->count(),
                'followers' => $user->followers()->count(),
            ],
            'financial' => [
                'payments_enabled' => $user->payments_enabled ? 'Yes' : 'No',
                'donations_made' => Donation::where('from_user_id', $user->id)->count(),
                'donations_received' => Donation::where('to_user_id', $user->id)->count(),
            ],
            'data_rights' => [
                'right_to_access' => 'You are viewing this summary now',
                'right_to_export' => 'You can download all your data in JSON format',
                'right_to_rectification' => 'You can edit your information in Profile and Preferences',
                'right_to_erasure' => 'You can delete your account from Preferences',
            ],
        ]);
    }
}