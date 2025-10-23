<?php

namespace Tests\Unit\Models;

use App\Models\Album;
use App\Models\Music;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlbumTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_user(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $album->user);
        $this->assertEquals($user->id, $album->user->id);
    }

    /** @test */
    public function it_has_many_tracks(): void
    {
        $album = Album::factory()->create();
        $music1 = Music::factory()->create(['album_id' => $album->id]);
        $music2 = Music::factory()->create(['album_id' => $album->id]);

        $this->assertCount(2, $album->tracks);
        $this->assertTrue($album->tracks->contains($music1));
        $this->assertTrue($album->tracks->contains($music2));
    }

    /** @test */
    public function it_can_be_liked_by_users(): void
    {
        $album = Album::factory()->create();
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $album->likedBy()->attach([$user1->id, $user2->id]);

        $this->assertCount(2, $album->likedBy);
        $this->assertTrue($album->likedBy->contains($user1));
        $this->assertTrue($album->likedBy->contains($user2));
    }

    /** @test */
    public function it_has_fillable_attributes(): void
    {
        $album = new Album();
        $fillable = $album->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('title', $fillable);
        $this->assertContains('type', $fillable);
        $this->assertContains('image', $fillable);
        $this->assertContains('artist_name', $fillable);
    }

    /** @test */
    public function it_can_be_created_with_valid_data(): void
    {
        $user = User::factory()->create();
        $album = Album::create([
            'user_id' => $user->id,
            'title' => 'Test Album',
            'type' => 'album',
            'artist_name' => 'Test Artist',
        ]);

        $this->assertDatabaseHas('albums', [
            'id' => $album->id,
            'title' => 'Test Album',
            'artist_name' => 'Test Artist',
        ]);
    }
}
