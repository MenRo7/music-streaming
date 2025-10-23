<?php

namespace Tests\Unit\Models;

use App\Models\Album;
use App\Models\Music;
use App\Models\Playlist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MusicTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_user(): void
    {
        $user = User::factory()->create();
        $music = Music::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $music->user);
        $this->assertEquals($user->id, $music->user->id);
    }

    /** @test */
    public function it_belongs_to_an_album(): void
    {
        $album = Album::factory()->create();
        $music = Music::factory()->create(['album_id' => $album->id]);

        $this->assertInstanceOf(Album::class, $music->album);
        $this->assertEquals($album->id, $music->album->id);
    }

    /** @test */
    public function it_can_belong_to_many_playlists(): void
    {
        $music = Music::factory()->create();
        $playlist1 = Playlist::factory()->create();
        $playlist2 = Playlist::factory()->create();

        $music->playlists()->attach([$playlist1->id, $playlist2->id]);

        $this->assertCount(2, $music->playlists);
        $this->assertTrue($music->playlists->contains($playlist1));
        $this->assertTrue($music->playlists->contains($playlist2));
    }

    /** @test */
    public function it_can_be_favored_by_users(): void
    {
        $music = Music::factory()->create();
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $music->favoredBy()->attach([$user1->id, $user2->id]);

        $this->assertCount(2, $music->favoredBy);
        $this->assertTrue($music->favoredBy->contains($user1));
        $this->assertTrue($music->favoredBy->contains($user2));
    }

    /** @test */
    public function it_returns_artist_from_user_name(): void
    {
        $user = User::factory()->create(['name' => 'John Doe']);
        $music = Music::factory()->create([
            'user_id' => $user->id,
            'artist_name' => 'Original Artist',
        ]);

        $this->assertEquals('John Doe', $music->artist);
    }

    /** @test */
    public function it_returns_artist_name_when_user_not_loaded(): void
    {
        $music = Music::factory()->create([
            'artist_name' => 'Fallback Artist',
        ]);

        // Force unload user relationship
        $music->unsetRelation('user');

        $this->assertEquals('Fallback Artist', $music->artist);
    }

    /** @test */
    public function it_has_fillable_attributes(): void
    {
        $music = new Music();
        $fillable = $music->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('album_id', $fillable);
        $this->assertContains('title', $fillable);
        $this->assertContains('audio', $fillable);
        $this->assertContains('image', $fillable);
        $this->assertContains('artist_name', $fillable);
        $this->assertContains('duration', $fillable);
    }

    /** @test */
    public function it_appends_artist_attribute(): void
    {
        $music = new Music();
        $appends = $music->getAppends();

        $this->assertContains('artist', $appends);
    }
}
