<?php

namespace Tests\Feature\GDPR;

use App\Models\AccountDeletionRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AccountDeletionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function unauthenticated_user_cannot_request_account_deletion(): void
    {
        $response = $this->postJson('/api/account/delete/request');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_request_account_deletion(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'user@example.com']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/account/delete/request');

        $response->assertStatus(200)
            ->assertJsonStructure(['message']);

        $this->assertDatabaseHas('account_deletion_requests', [
            'user_id' => $user->id,
        ]);

        Mail::assertSent(function (\Illuminate\Mail\Mailable $mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    /** @test */
    public function requesting_deletion_creates_token_with_expiry(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/account/delete/request');

        $request = AccountDeletionRequest::where('user_id', $user->id)->first();

        $this->assertNotNull($request);
        $this->assertNotNull($request->token);
        $this->assertNotNull($request->expires_at);
        $this->assertTrue($request->expires_at->isFuture());
    }

    /** @test */
    public function previous_deletion_requests_are_deleted_on_new_request(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        // Create first request
        AccountDeletionRequest::create([
            'user_id' => $user->id,
            'token' => 'old-token',
            'expires_at' => now()->addHours(24),
        ]);

        // Create second request
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/account/delete/request');

        // Only one request should exist
        $requests = AccountDeletionRequest::where('user_id', $user->id)->get();

        $this->assertCount(1, $requests);
        $this->assertNotEquals('old-token', $requests->first()->token);
    }

    /** @test */
    public function valid_token_confirms_account_deletion(): void
    {
        $user = User::factory()->create();

        $request = AccountDeletionRequest::create([
            'user_id' => $user->id,
            'token' => 'valid-token',
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->get('/api/account/delete/confirm/valid-token');

        $response->assertStatus(200)
            ->assertSee('Votre compte a été supprimé');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('account_deletion_requests', ['id' => $request->id]);
    }

    /** @test */
    public function expired_token_shows_error(): void
    {
        $user = User::factory()->create();

        AccountDeletionRequest::create([
            'user_id' => $user->id,
            'token' => 'expired-token',
            'expires_at' => now()->subHours(1), // Expired
        ]);

        $response = $this->get('/api/account/delete/confirm/expired-token');

        $response->assertStatus(400)
            ->assertSee('Lien invalide ou expiré');

        // User should still exist
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    /** @test */
    public function invalid_token_shows_error(): void
    {
        $response = $this->get('/api/account/delete/confirm/invalid-token');

        $response->assertStatus(400)
            ->assertSee('Lien invalide ou expiré');
    }

    /** @test */
    public function rate_limiting_applies_to_deletion_requests(): void
    {
        $user = User::factory()->create();

        // Make 4 requests (assuming limit is 3)
        for ($i = 0; $i < 4; $i++) {
            $response = $this->actingAs($user, 'sanctum')
                ->postJson('/api/account/delete/request');

            if ($i < 3) {
                $response->assertStatus(200);
            } else {
                $response->assertStatus(429); // Too Many Requests
            }
        }
    }
}
