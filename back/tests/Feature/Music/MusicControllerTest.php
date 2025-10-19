<?php

namespace Tests\Feature\Music;

use App\Models\Music;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MusicControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    /** @test */
    public function guest_cannot_access_music_endpoints()
    {
        $response = $this->getJson('/api/music');
        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_list_music()
    {
        $user = User::factory()->create();
        Music::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/music');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'artist', 'user_id'],
                ],
            ]);
    }

    /** @test */
    public function user_can_view_own_music()
    {
        $user = User::factory()->create();
        $music = Music::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/music/{$music->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $music->id,
                'title' => $music->title,
            ]);
    }

    /** @test */
    public function user_can_create_music()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/music', [
                'title' => 'Test Song',
                'artist' => 'Test Artist',
                'duration' => 180,
                'file' => UploadedFile::fake()->create('song.mp3', 5000),
                'cover' => UploadedFile::fake()->image('cover.jpg'),
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'title', 'artist']);

        $this->assertDatabaseHas('music', [
            'title' => 'Test Song',
            'artist' => 'Test Artist',
            'user_id' => $user->id,
        ]);
    }

    /** @test */
    public function user_can_update_own_music()
    {
        $user = User::factory()->create();
        $music = Music::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/music/{$music->id}", [
                'title' => 'Updated Title',
                'artist' => 'Updated Artist',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('music', [
            'id' => $music->id,
            'title' => 'Updated Title',
            'artist' => 'Updated Artist',
        ]);
    }

    /** @test */
    public function user_cannot_update_others_music()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $music = Music::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2, 'sanctum')
            ->putJson("/api/music/{$music->id}", [
                'title' => 'Hacked Title',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_delete_own_music()
    {
        $user = User::factory()->create();
        $music = Music::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/music/{$music->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('music', [
            'id' => $music->id,
        ]);
    }

    /** @test */
    public function creating_music_requires_validation()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/music', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'artist']);
    }
}
