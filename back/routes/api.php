<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PreferencesController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('throttle:6,1')->group(function () {
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-email-code', [AuthController::class, 'resendEmailCode']);
    Route::post('/login/verify', [AuthController::class, 'verify2fa']);
    Route::post('/login/resend', [AuthController::class, 'resend2fa']);
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('/password/reset',  [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/my-musics', [MusicController::class, 'myMusic']);
    Route::post('/music', [MusicController::class, 'store']);
    Route::get('/music', [MusicController::class, 'index']);
    Route::get('/music/{id}', [MusicController::class, 'show']);
    Route::put('/music/{id}', [MusicController::class, 'update']);
    Route::delete('/music/{id}', [MusicController::class, 'destroy']);
    Route::post('/music/exists', [MusicController::class, 'exists']);

    Route::get('/my-albums', [AlbumController::class, 'myAlbums']);
    Route::post('/album', [AlbumController::class, 'store']);
    Route::get('/album', [AlbumController::class, 'index']);
    Route::get('/album/{id}', [AlbumController::class, 'show']);
    Route::put('/album/{id}', [AlbumController::class, 'update']);
    Route::delete('/album/{id}', [AlbumController::class, 'destroy']);
    Route::post('/album/{id}/like', [AlbumController::class, 'like']);
    Route::delete('/album/{id}/like', [AlbumController::class, 'unlike']);

    Route::get('/user', [UserController::class, 'getUser']);
    Route::post('/user/update', [UserController::class, 'updateUser']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::get('/users/{id}/summary', [UserController::class, 'summary']);

    Route::get('/playlists', [PlaylistController::class, 'index']);
    Route::get('/playlists/{id}', [PlaylistController::class, 'show']);
    Route::post('/playlists', [PlaylistController::class, 'store']);
    Route::post('/playlists/{playlist}/add-music', [PlaylistController::class, 'addMusic']);
    Route::post('/playlists/{playlist}/remove-music', [PlaylistController::class, 'removeMusic']);
    Route::put('/playlists/{id}', [PlaylistController::class, 'update']);
    Route::delete('/playlists/{id}', [PlaylistController::class, 'destroy']);
    Route::post('/playlists/{id}/like', [PlaylistController::class, 'like']);
    Route::delete('/playlists/{id}/like', [PlaylistController::class, 'unlike']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{music}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{music}', [FavoriteController::class, 'destroy']);

    Route::post('/users/{id}/subscribe', [UserController::class, 'subscribe']);
    Route::delete('/users/{id}/subscribe', [UserController::class, 'unsubscribe']);
    Route::get('/users/{id}/subscribe', [UserController::class, 'isSubscribed']);

    Route::get('/likes/summary', [UserController::class, 'likesSummary']);
    Route::get('/search', [GlobalSearchController::class, 'search']);
    Route::post('/users/{id}/donate/checkout', [DonationController::class, 'createCheckoutSession']);

    Route::get('/preferences', [PreferencesController::class, 'index']);
    Route::post('/preferences/locale', [PreferencesController::class, 'setLocale']);
    Route::post('/preferences/stripe/onboarding', [PreferencesController::class, 'createStripeOnboarding']);
    Route::get('/preferences/stripe/status', [PreferencesController::class, 'stripeStatus']);
});

Route::get('/search', [GlobalSearchController::class, 'search']);
Route::post('/stripe/webhook', [DonationController::class, 'webhook']);