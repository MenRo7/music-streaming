<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Music extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'album_id', 'title', 'audio', 'image', 'artist_name'];
    protected $appends = ['artist'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function album()
    {
        return $this->belongsTo(Album::class);
    }

    public function playlists()
    {
        return $this->belongsToMany(Playlist::class, 'music_playlist', 'music_id', 'playlist_id');
    }

    public function getArtistAttribute()
    {
        return optional($this->user)->name ?? $this->artist_name;
    }
}


