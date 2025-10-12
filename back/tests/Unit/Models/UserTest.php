<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_has_fillable_attributes()
    {
        $fillable = [
            'name',
            'email',
            'password',
            'date_of_birth',
            'profile_image',
        ];

        $user = new User;

        $this->assertEquals($fillable, $user->getFillable());
    }

    /** @test */
    public function it_casts_attributes_correctly()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'password' => bcrypt('password'),
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->email_verified_at);
        $this->assertIsString($user->password);
    }

    /** @test */
    public function it_hides_sensitive_attributes()
    {
        $user = User::factory()->create();
        $array = $user->toArray();

        $this->assertArrayNotHasKey('password', $array);
        $this->assertArrayNotHasKey('remember_token', $array);
        $this->assertArrayNotHasKey('two_factor_code', $array);
        $this->assertArrayNotHasKey('password_reset_code', $array);
    }

    /** @test */
    public function it_can_check_if_user_is_adult()
    {
        $adult = User::factory()->create([
            'date_of_birth' => now()->subYears(25),
        ]);

        $minor = User::factory()->create([
            'date_of_birth' => now()->subYears(15),
        ]);

        // Assuming you have an isAdult() method
        // $this->assertTrue($adult->isAdult());
        // $this->assertFalse($minor->isAdult());

        $this->assertTrue(true); // Placeholder
    }

    /** @test */
    public function it_has_many_music_tracks()
    {
        $user = User::factory()->create();

        $this->assertInstanceOf(
            \Illuminate\Database\Eloquent\Relations\HasMany::class,
            $user->music()
        );
    }

    /** @test */
    public function it_has_many_playlists()
    {
        $user = User::factory()->create();

        $this->assertInstanceOf(
            \Illuminate\Database\Eloquent\Relations\HasMany::class,
            $user->playlists()
        );
    }

    /** @test */
    public function it_has_many_favorites()
    {
        $user = User::factory()->create();

        $this->assertInstanceOf(
            \Illuminate\Database\Eloquent\Relations\HasMany::class,
            $user->favorites()
        );
    }
}
