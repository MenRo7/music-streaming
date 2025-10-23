<?php

namespace Tests\Feature\Album;

use App\Models\Album;
use App\Models\Music;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AlbumControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    /** @test */
    public function unauthenticated_user_cannot_access_albums(): void
    {
        $response = $this->getJson('/api/my-albums');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_view_their_albums(): void
    {
        $user = User::factory()->create();
        $album1 = Album::factory()->create(['user_id' => $user->id, 'title' => 'Album 1']);
        $album2 = Album::factory()->create(['user_id' => $user->id, 'title' => 'Album 2']);

        // Create album from another user (should not appear)
        Album::factory()->create(['title' => 'Other Album']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/my-albums');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment(['title' => 'Album 1'])
            ->assertJsonFragment(['title' => 'Album 2']);
    }

    /** @test */
    public function user_can_view_single_album_with_tracks(): void
    {
        $album = Album::factory()->create(['title' => 'Test Album']);
        $music = Music::factory()->create(['album_id' => $album->id, 'title' => 'Test Song']);

        $response = $this->getJson("/api/album/{$album->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Test Album'])
            ->assertJsonPath('tracks.0.title', 'Test Song');
    }

    /** @test */
    public function viewing_non_existent_album_returns_404(): void
    {
        $response = $this->getJson('/api/album/99999');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Album non trouvé']);
    }

    /** @test */
    public function authenticated_user_can_create_album(): void
    {
        $user = User::factory()->create(['name' => 'Artist Name']);
        $audioFile = UploadedFile::fake()->create('song.mp3', 1000, 'audio/mpeg');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/album', [
                'title' => 'New Album',
                'type' => 'album',
                'songs' => [
                    [
                        'title' => 'Song 1',
                        'audio' => $audioFile,
                    ],
                ],
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('albums', [
            'title' => 'New Album',
            'type' => 'album',
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseHas('music', [
            'title' => 'Song 1',
            'user_id' => $user->id,
        ]);
    }

    /** @test */
    public function creating_album_requires_title(): void
    {
        $user = User::factory()->create();
        $audioFile = UploadedFile::fake()->create('song.mp3', 1000, 'audio/mpeg');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/album', [
                'type' => 'album',
                'songs' => [
                    ['title' => 'Song 1', 'audio' => $audioFile],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    /** @test */
    public function creating_album_requires_at_least_one_song(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/album', [
                'title' => 'Empty Album',
                'type' => 'album',
                'songs' => [],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['songs']);
    }

    /** @test */
    public function user_can_update_their_own_album(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id, 'title' => 'Old Title']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/album/{$album->id}", [
                'title' => 'Updated Title',
                'type' => 'album',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('albums', [
            'id' => $album->id,
            'title' => 'Updated Title',
        ]);
    }

    /** @test */
    public function user_cannot_update_another_users_album(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2, 'sanctum')
            ->putJson("/api/album/{$album->id}", [
                'title' => 'Hacked Title',
                'type' => 'album',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_delete_their_own_album(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/album/{$album->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('albums', ['id' => $album->id]);
    }

    /** @test */
    public function user_cannot_delete_another_users_album(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2, 'sanctum')
            ->deleteJson("/api/album/{$album->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('albums', ['id' => $album->id]);
    }

    /** @test */
    public function user_can_like_an_album(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/album/{$album->id}/like");

        $response->assertStatus(200);

        $this->assertDatabaseHas('album_likes', [
            'user_id' => $user->id,
            'album_id' => $album->id,
        ]);
    }

    /** @test */
    public function user_can_unlike_an_album(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create();
        $album->likedBy()->attach($user->id);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/album/{$album->id}/like");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('album_likes', [
            'user_id' => $user->id,
            'album_id' => $album->id,
        ]);
    }
}
