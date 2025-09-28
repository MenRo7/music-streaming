<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\FavoriteController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user', [AuthController::class, 'user']);

    Route::get('/my-musics', [MusicController::class, 'myMusic']);
    Route::post('/music', [MusicController::class, 'store']);
    Route::get('/music', [MusicController::class, 'index']);
    Route::get('/music/{id}', [MusicController::class, 'show']);
    Route::put('/music/{id}', [MusicController::class, 'update']);
    Route::delete('/music/{id}', [MusicController::class, 'destroy']);
    
    Route::get('/my-albums', [AlbumController::class, 'myAlbums']);
    Route::post('/album', [AlbumController::class, 'store']);
    Route::get('/album', [AlbumController::class, 'index']);
    Route::get('/album/{id}', [AlbumController::class, 'show']);
    Route::put('/album/{id}', [AlbumController::class, 'update']);
    Route::delete('/album/{id}', [AlbumController::class, 'destroy']);

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

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{music}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{music}', [FavoriteController::class, 'destroy']);

    Route::get('/search', [GlobalSearchController::class, 'search']);
});

Route::get('/search', [GlobalSearchController::class, 'search']);