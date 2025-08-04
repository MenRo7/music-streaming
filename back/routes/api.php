<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\AlbumController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user', [AuthController::class, 'user']);

    Route::post('/music', [MusicController::class, 'store']);
    Route::post('/album', [AlbumController::class, 'store']);

    Route::get('/user', [UserController::class, 'getUser']);
    Route::post('/user/update', [UserController::class, 'updateUser']);

    Route::get('/playlists', [PlaylistController::class, 'index']);
    Route::get('/playlists/{id}', [PlaylistController::class, 'show']);
    Route::post('/playlists', [PlaylistController::class, 'store']);
    Route::put('/playlists/{id}', [PlaylistController::class, 'update']);
    Route::delete('/playlists/{id}', [PlaylistController::class, 'destroy']);

    Route::get('/search', [GlobalSearchController::class, 'search']);
});

Route::get('/search', [GlobalSearchController::class, 'search']);