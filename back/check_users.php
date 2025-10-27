<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = \App\Models\User::all(['id', 'name', 'email', 'email_verified_at', 'created_at']);

echo 'Total users: ' . $users->count() . "\n\n";

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Name: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo 'Verified: ' . ($user->email_verified_at ? 'Yes' : 'No') . "\n";
    echo "Created: {$user->created_at}\n";
    echo "---\n";
}
