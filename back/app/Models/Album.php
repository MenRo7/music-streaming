<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'title', 'type', 'image', 'artist_name'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tracks()
    {
        return $this->hasMany(Music::class, 'album_id');
    }

    public function likedBy()
    {
        return $this->belongsToMany(\App\Models\User::class, 'album_likes')
            ->withTimestamps();
    }
}

