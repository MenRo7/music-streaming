<?php

use App\Http\Controllers\AudioStreamController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/stream/{filename}', [AudioStreamController::class, 'stream'])
    ->where('filename', '.*')
    ->name('stream.music');
