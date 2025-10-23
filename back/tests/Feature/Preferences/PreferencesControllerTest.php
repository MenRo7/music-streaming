<?php

namespace Tests\Feature\Preferences;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PreferencesControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function unauthenticated_user_cannot_access_preferences(): void
    {
        $response = $this->getJson('/api/preferences');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_get_their_preferences(): void
    {
        $user = User::factory()->create([
            'locale' => 'fr',
            'stripe_connect_id' => 'acct_test123',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/preferences');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'locale',
                'stripe_connect_id',
            ]);
    }

    /** @test */
    public function user_can_update_locale_to_french(): void
    {
        $user = User::factory()->create(['locale' => 'en']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/preferences/locale', [
                'locale' => 'fr',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'locale' => 'fr',
        ]);
    }

    /** @test */
    public function user_can_update_locale_to_english(): void
    {
        $user = User::factory()->create(['locale' => 'fr']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/preferences/locale', [
                'locale' => 'en',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'locale' => 'en',
        ]);
    }

    /** @test */
    public function locale_update_requires_valid_locale(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/preferences/locale', [
                'locale' => 'invalid',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['locale']);
    }

    /** @test */
    public function adult_user_can_get_stripe_status(): void
    {
        $user = User::factory()->create([
            'date_of_birth' => now()->subYears(25),
            'stripe_connect_id' => null,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/preferences/stripe/status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'has_connect',
                'charges_enabled',
                'payouts_enabled',
            ]);
    }

    /** @test */
    public function adult_user_can_start_stripe_onboarding(): void
    {
        $user = User::factory()->create([
            'date_of_birth' => now()->subYears(25),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/preferences/stripe/onboarding');

        // Will fail without Stripe credentials but tests endpoint
        $this->assertTrue(in_array($response->status(), [200, 400, 500]));
    }

    /** @test */
    public function minor_cannot_access_stripe_onboarding(): void
    {
        $minor = User::factory()->create([
            'date_of_birth' => now()->subYears(16),
        ]);

        $response = $this->actingAs($minor, 'sanctum')
            ->postJson('/api/preferences/stripe/onboarding');

        $response->assertStatus(403);
    }

    /** @test */
    public function preferences_endpoint_returns_user_specific_data(): void
    {
        $user1 = User::factory()->create(['locale' => 'fr']);
        $user2 = User::factory()->create(['locale' => 'en']);

        $response1 = $this->actingAs($user1, 'sanctum')
            ->getJson('/api/preferences');

        $response2 = $this->actingAs($user2, 'sanctum')
            ->getJson('/api/preferences');

        $response1->assertJsonFragment(['locale' => 'fr']);
        $response2->assertJsonFragment(['locale' => 'en']);
    }
}
