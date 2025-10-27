<?php

namespace Tests\Feature\User;

use App\Models\Album;
use App\Models\Music;
use App\Models\Playlist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    /** @test */
    public function unauthenticated_user_cannot_access_user_endpoints(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_get_their_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ]);
    }

    /** @test */
    public function user_can_update_their_profile(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/update', [
                'name' => 'New Name',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
        ]);
    }

    /** @test */
    public function user_can_update_profile_with_image(): void
    {
        $user = User::factory()->create();
        $image = UploadedFile::fake()->image('profile.jpg');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/update', [
                'name' => $user->name,
                'profile_image' => $image,
            ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertNotNull($user->profile_image);
    }

    /** @test */
    public function user_can_view_another_user_profile(): void
    {
        $user = User::factory()->create(['name' => 'Profile User']);

        $response = $this->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Profile User']);
    }

    /** @test */
    public function viewing_non_existent_user_returns_404(): void
    {
        $response = $this->getJson('/api/users/99999');

        $response->assertStatus(404);
    }

    /** @test */
    public function user_can_view_summary_of_another_user(): void
    {
        $user = User::factory()->create();
        Music::factory()->count(5)->create(['user_id' => $user->id]);
        Album::factory()->count(2)->create(['user_id' => $user->id]);
        Playlist::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/users/{$user->id}/summary");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'tracks_count',
                'albums_count',
                'playlists_count',
            ]);
    }

    /** @test */
    public function user_can_follow_another_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $response = $this->actingAs($user1, 'sanctum')
            ->postJson("/api/users/{$user2->id}/subscribe");

        $response->assertStatus(200);

        $this->assertDatabaseHas('user_follows', [
            'follower_id' => $user1->id,
            'followed_id' => $user2->id,
        ]);
    }

    /** @test */
    public function user_can_unfollow_another_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user1->following()->attach($user2->id);

        $response = $this->actingAs($user1, 'sanctum')
            ->deleteJson("/api/users/{$user2->id}/subscribe");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('user_follows', [
            'follower_id' => $user1->id,
            'followed_id' => $user2->id,
        ]);
    }

    /** @test */
    public function user_can_check_if_following_another_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user1->following()->attach($user2->id);

        $response = $this->actingAs($user1, 'sanctum')
            ->getJson("/api/users/{$user2->id}/subscribe");

        $response->assertStatus(200)
            ->assertJson(['subscribed' => true]);
    }

    /** @test */
    public function user_cannot_follow_themselves(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/users/{$user->id}/subscribe");

        $response->assertStatus(400);
    }

    /** @test */
    public function user_can_get_likes_summary(): void
    {
        $user = User::factory()->create();
        $music = Music::factory()->create();
        $album = Album::factory()->create();
        $playlist = Playlist::factory()->create();

        $user->favorites()->attach($music->id);
        $user->likedAlbums()->attach($album->id);
        $user->likedPlaylists()->attach($playlist->id);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/likes/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'music_ids',
                'album_ids',
                'playlist_ids',
            ]);
    }
}
