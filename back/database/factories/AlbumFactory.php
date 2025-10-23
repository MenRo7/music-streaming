<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AlbumFactory extends Factory
{
    protected $model = Album::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->words(3, true),
            'type' => fake()->randomElement(['album', 'single', 'EP']),
            'image' => null,
            'artist_name' => fake()->name(),
        ];
    }
}
