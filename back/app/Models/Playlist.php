<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'image'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function musics()
    {
        return $this->belongsToMany(Music::class, 'music_playlist', 'playlist_id', 'music_id')
            ->withTimestamps();
    }

    public function likedBy()
    {
        return $this->belongsToMany(\App\Models\User::class, 'playlist_likes')
            ->withTimestamps();
    }
}
