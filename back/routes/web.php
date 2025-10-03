<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AudioStreamController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/stream/{filename}', [AudioStreamController::class, 'stream'])
    ->where('filename', '.*')
    ->name('stream.music');
