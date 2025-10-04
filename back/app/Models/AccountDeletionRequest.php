<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountDeletionRequest extends Model
{
    public $timestamps = false;
    protected $fillable = ['user_id', 'token', 'expires_at'];
    protected $casts = ['expires_at' => 'datetime'];
}
