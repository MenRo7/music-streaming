<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\Music;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MusicFactory extends Factory
{
    protected $model = Music::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'album_id' => null,
            'title' => fake()->sentence(3),
            'audio' => 'music/test-audio.mp3',
            'image' => null,
            'artist_name' => fake()->name(),
            'duration' => fake()->numberBetween(60, 300), // 1-5 minutes
        ];
    }

    public function withAlbum(): static
    {
        return $this->state(fn (array $attributes) => [
            'album_id' => Album::factory(),
        ]);
    }
}
