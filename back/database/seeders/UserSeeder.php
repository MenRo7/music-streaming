<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a verified test user with Yopmail address
        $user = User::firstOrCreate(
            ['email' => 'testmusic@yopmail.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('Test@Password123'),
                'date_of_birth' => '1990-01-01',
                'email_verified_at' => now(),
            ]
        );

        if (!$user->hasRole('user')) {
            $user->assignRole('user');
        }

        echo "Test user created/updated:\n";
        echo "Email: testmusic@yopmail.com\n";
        echo "Password: Test@Password123\n";
        echo "Check emails at: https://yopmail.com/en/testmusic\n";
    }
}
