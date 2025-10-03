<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasRoles, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_image',
        'email_verification_code',
        'email_verification_expires_at',
        'two_factor_code',
        'two_factor_expires_at',
        'password_reset_code',
        'password_reset_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'email_verification_expires_at' => 'datetime',
            'two_factor_expires_at' => 'datetime',
            'password' => 'hashed',
            'password_reset_expires_at' => 'datetime',
            'payments_enabled' => 'boolean',
        ];
    }

    public function playlists()
    {
        return $this->hasMany(Playlist::class);
    }

    public function favorites()
    {
        return $this->belongsToMany(\App\Models\Music::class, 'favorites')
            ->withTimestamps();
    }

    public function likedAlbums()
    {
        return $this->belongsToMany(\App\Models\Album::class, 'album_likes')
            ->withTimestamps();
    }

    public function likedPlaylists()
    {
        return $this->belongsToMany(\App\Models\Playlist::class, 'playlist_likes')
            ->withTimestamps();
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'user_follows', 'follower_id', 'followed_id')->withTimestamps();
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'user_follows', 'followed_id', 'follower_id')->withTimestamps();
    }
}
