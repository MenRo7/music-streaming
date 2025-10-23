<?php

namespace Tests\Unit\Models;

use App\Models\Music;
use App\Models\Playlist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlaylistTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_user(): void
    {
        $user = User::factory()->create();
        $playlist = Playlist::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $playlist->user);
        $this->assertEquals($user->id, $playlist->user->id);
    }

    /** @test */
    public function it_can_have_many_musics(): void
    {
        $playlist = Playlist::factory()->create();
        $music1 = Music::factory()->create();
        $music2 = Music::factory()->create();

        $playlist->musics()->attach([$music1->id, $music2->id]);

        $this->assertCount(2, $playlist->musics);
        $this->assertTrue($playlist->musics->contains($music1));
        $this->assertTrue($playlist->musics->contains($music2));
    }

    /** @test */
    public function it_can_be_liked_by_users(): void
    {
        $playlist = Playlist::factory()->create();
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $playlist->likedBy()->attach([$user1->id, $user2->id]);

        $this->assertCount(2, $playlist->likedBy);
        $this->assertTrue($playlist->likedBy->contains($user1));
        $this->assertTrue($playlist->likedBy->contains($user2));
    }

    /** @test */
    public function it_has_fillable_attributes(): void
    {
        $playlist = new Playlist();
        $fillable = $playlist->getFillable();

        $this->assertContains('title', $fillable);
        $this->assertContains('image', $fillable);
    }

    /** @test */
    public function it_can_be_created_with_valid_data(): void
    {
        $user = User::factory()->create();
        $playlist = Playlist::create([
            'user_id' => $user->id,
            'title' => 'My Playlist',
            'image' => null,
        ]);

        $this->assertDatabaseHas('playlists', [
            'id' => $playlist->id,
            'title' => 'My Playlist',
        ]);
    }
}
