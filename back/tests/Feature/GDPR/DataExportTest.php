<?php

namespace Tests\Feature\GDPR;

use App\Models\Album;
use App\Models\Music;
use App\Models\Playlist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataExportTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function unauthenticated_user_cannot_export_data(): void
    {
        $response = $this->getJson('/api/account/data/export');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_get_data_summary(): void
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        // Create some data
        Music::factory()->count(3)->create(['user_id' => $user->id]);
        Album::factory()->count(2)->create(['user_id' => $user->id]);
        Playlist::factory()->count(1)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/account/data/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'personal_information' => [
                    'name',
                    'email',
                    'account_created',
                ],
                'content_statistics' => [
                    'uploaded_tracks',
                    'created_albums',
                    'created_playlists',
                ],
            ])
            ->assertJsonPath('personal_information.name', 'John Doe')
            ->assertJsonPath('personal_information.email', 'john@example.com')
            ->assertJsonPath('content_statistics.uploaded_tracks', 3)
            ->assertJsonPath('content_statistics.created_albums', 2)
            ->assertJsonPath('content_statistics.created_playlists', 1);
    }

    /** @test */
    public function authenticated_user_can_export_full_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/account/data/export');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json')
            ->assertHeader('Content-Disposition')
            ->assertJsonStructure([
                'export_date',
                'user',
                'music',
                'albums',
                'playlists',
            ]);
    }

    /** @test */
    public function data_export_includes_all_user_content(): void
    {
        $user = User::factory()->create(['name' => 'Test User']);
        $music = Music::factory()->create([
            'user_id' => $user->id,
            'title' => 'My Song',
        ]);
        $album = Album::factory()->create([
            'user_id' => $user->id,
            'title' => 'My Album',
        ]);
        $playlist = Playlist::factory()->create([
            'user_id' => $user->id,
            'title' => 'My Playlist',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/account/data/export');

        $response->assertStatus(200);

        $data = $response->json();

        $this->assertEquals('Test User', $data['user']['name']);
        $this->assertCount(1, $data['music']);
        $this->assertEquals('My Song', $data['music'][0]['title']);
        $this->assertCount(1, $data['albums']);
        $this->assertEquals('My Album', $data['albums'][0]['title']);
        $this->assertCount(1, $data['playlists']);
        $this->assertEquals('My Playlist', $data['playlists'][0]['title']);
    }

    /** @test */
    public function data_summary_includes_social_statistics(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();

        // User1 follows user2 and user3
        $user1->following()->attach([$user2->id, $user3->id]);

        // User2 and user3 follow user1
        $user2->following()->attach($user1->id);
        $user3->following()->attach($user1->id);

        $response = $this->actingAs($user1, 'sanctum')
            ->getJson('/api/account/data/summary');

        $response->assertStatus(200)
            ->assertJsonPath('social.following', 2)
            ->assertJsonPath('social.followers', 2);
    }

    /** @test */
    public function data_summary_includes_favorite_count(): void
    {
        $user = User::factory()->create();
        $music1 = Music::factory()->create();
        $music2 = Music::factory()->create();
        $music3 = Music::factory()->create();

        $user->favorites()->attach([$music1->id, $music2->id, $music3->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/account/data/summary');

        $response->assertStatus(200)
            ->assertJsonPath('content_statistics.favorite_tracks', 3);
    }
}
