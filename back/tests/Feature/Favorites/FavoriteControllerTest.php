<?php

namespace Tests\Feature\Favorites;

use App\Models\Music;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FavoriteControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function unauthenticated_user_cannot_access_favorites(): void
    {
        $response = $this->getJson('/api/favorites');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_view_their_favorites(): void
    {
        $user = User::factory()->create();
        $music1 = Music::factory()->create(['title' => 'Favorite Song 1']);
        $music2 = Music::factory()->create(['title' => 'Favorite Song 2']);

        $user->favorites()->attach([$music1->id, $music2->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/favorites');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    /** @test */
    public function user_can_add_music_to_favorites(): void
    {
        $user = User::factory()->create();
        $music = Music::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/favorites/{$music->id}");

        $response->assertStatus(200);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $user->id,
            'music_id' => $music->id,
        ]);
    }

    /** @test */
    public function user_cannot_add_same_music_to_favorites_twice(): void
    {
        $user = User::factory()->create();
        $music = Music::factory()->create();
        $user->favorites()->attach($music->id);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/favorites/{$music->id}");

        // Should handle gracefully (200 or 409)
        $this->assertTrue(in_array($response->status(), [200, 409]));

        // Should still have only one entry
        $this->assertEquals(1, $user->favorites()->where('music_id', $music->id)->count());
    }

    /** @test */
    public function user_can_remove_music_from_favorites(): void
    {
        $user = User::factory()->create();
        $music = Music::factory()->create();
        $user->favorites()->attach($music->id);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/favorites/{$music->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('favorites', [
            'user_id' => $user->id,
            'music_id' => $music->id,
        ]);
    }

    /** @test */
    public function removing_non_favorited_music_handles_gracefully(): void
    {
        $user = User::factory()->create();
        $music = Music::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/favorites/{$music->id}");

        // Should handle gracefully (200 or 404)
        $this->assertTrue(in_array($response->status(), [200, 404]));
    }

    /** @test */
    public function adding_non_existent_music_to_favorites_returns_404(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/favorites/99999');

        $response->assertStatus(404);
    }

    /** @test */
    public function favorites_list_shows_only_users_favorites(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $music1 = Music::factory()->create();
        $music2 = Music::factory()->create();
        $music3 = Music::factory()->create();

        $user1->favorites()->attach([$music1->id, $music2->id]);
        $user2->favorites()->attach($music3->id);

        $response = $this->actingAs($user1, 'sanctum')
            ->getJson('/api/favorites');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }
}
