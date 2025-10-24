<?php

use App\Http\Controllers\AudioStreamController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/stream/{filename}', [AudioStreamController::class, 'stream'])
    ->where('filename', '.*')
    ->name('stream.music');

// Dynamic Sitemap for SEO
Route::get('/sitemap.xml', [SitemapController::class, 'index'])
    ->name('sitemap');
