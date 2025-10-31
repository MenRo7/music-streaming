<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => [
        'api/*',
        'stream/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(
        explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000'))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'Accept', 'Authorization', 'X-CSRF-TOKEN'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => (bool) env('CORS_SUPPORTS_CREDENTIALS', true),

];
