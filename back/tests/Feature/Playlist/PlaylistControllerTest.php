<?php

namespace Tests\Feature\Playlist;

use App\Models\Music;
use App\Models\Playlist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlaylistControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function unauthenticated_user_cannot_access_playlists(): void
    {
        $response = $this->getJson('/api/playlists');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_view_their_playlists(): void
    {
        $user = User::factory()->create();
        $playlist1 = Playlist::factory()->create(['user_id' => $user->id, 'title' => 'Playlist 1']);
        $playlist2 = Playlist::factory()->create(['user_id' => $user->id, 'title' => 'Playlist 2']);

        // Create playlist from another user (should not appear)
        Playlist::factory()->create(['title' => 'Other Playlist']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/playlists');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment(['title' => 'Playlist 1'])
            ->assertJsonFragment(['title' => 'Playlist 2']);
    }

    /** @test */
    public function user_can_view_single_playlist(): void
    {
        $playlist = Playlist::factory()->create(['title' => 'Test Playlist']);
        $music = Music::factory()->create();
        $playlist->musics()->attach($music->id);

        $response = $this->getJson("/api/playlists/{$playlist->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Test Playlist']);
    }

    /** @test */
    public function viewing_non_existent_playlist_returns_404(): void
    {
        $response = $this->getJson('/api/playlists/99999');

        $response->assertStatus(404);
    }

    /** @test */
    public function authenticated_user_can_create_playlist(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/playlists', [
                'title' => 'New Playlist',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('playlists', [
            'title' => 'New Playlist',
            'user_id' => $user->id,
        ]);
    }

    /** @test */
    public function creating_playlist_requires_title(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/playlists', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    /** @test */
    public function user_can_update_their_own_playlist(): void
    {
        $user = User::factory()->create();
        $playlist = Playlist::factory()->create(['user_id' => $user->id, 'title' => 'Old Title']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/playlists/{$playlist->id}", [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('playlists', [
            'id' => $playlist->id,
            'title' => 'Updated Title',
        ]);
    }

    /** @test */
    public function user_cannot_update_another_users_playlist(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $playlist = Playlist::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2, 'sanctum')
            ->putJson("/api/playlists/{$playlist->id}", [
                'title' => 'Hacked Title',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_delete_their_own_playlist(): void
    {
        $user = User::factory()->create();
        $playlist = Playlist::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/playlists/{$playlist->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('playlists', ['id' => $playlist->id]);
    }

    /** @test */
    public function user_cannot_delete_another_users_playlist(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $playlist = Playlist::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2, 'sanctum')
            ->deleteJson("/api/playlists/{$playlist->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('playlists', ['id' => $playlist->id]);
    }

    /** @test */
    public function user_can_add_music_to_playlist(): void
    {
        $user = User::factory()->create();
        $playlist = Playlist::factory()->create(['user_id' => $user->id]);
        $music = Music::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/playlists/{$playlist->id}/add-music", [
                'music_id' => $music->id,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('music_playlist', [
            'playlist_id' => $playlist->id,
            'music_id' => $music->id,
        ]);
    }

    /** @test */
    public function user_can_remove_music_from_playlist(): void
    {
        $user = User::factory()->create();
        $playlist = Playlist::factory()->create(['user_id' => $user->id]);
        $music = Music::factory()->create();
        $playlist->musics()->attach($music->id);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/playlists/{$playlist->id}/remove-music", [
                'music_id' => $music->id,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('music_playlist', [
            'playlist_id' => $playlist->id,
            'music_id' => $music->id,
        ]);
    }

    /** @test */
    public function user_can_like_a_playlist(): void
    {
        $user = User::factory()->create();
        $playlist = Playlist::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/playlists/{$playlist->id}/like");

        $response->assertStatus(200);

        $this->assertDatabaseHas('playlist_likes', [
            'user_id' => $user->id,
            'playlist_id' => $playlist->id,
        ]);
    }

    /** @test */
    public function user_can_unlike_a_playlist(): void
    {
        $user = User::factory()->create();
        $playlist = Playlist::factory()->create();
        $playlist->likedBy()->attach($user->id);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/playlists/{$playlist->id}/like");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('playlist_likes', [
            'user_id' => $user->id,
            'playlist_id' => $playlist->id,
        ]);
    }
}
