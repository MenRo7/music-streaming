<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        if (env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');
        }

        $res = $next($request);

        $res->headers->set('X-Content-Type-Options', 'nosniff');
        $res->headers->set('X-Frame-Options', 'DENY');
        $res->headers->set('Referrer-Policy', 'no-referrer');
        $res->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        if (app()->environment('production')) {
            $res->headers->set('Strict-Transport-Security','max-age=31536000; includeSubDomains; preload');
            $res->headers->set('Content-Security-Policy', $this->prodCsp());
        } else {
            $res->headers->set('Content-Security-Policy', $this->devCsp());
        }

        return $res;
    }

    private function devCsp(): string
    {
        $api  = 'http://127.0.0.1:8000';
        $vite = 'http://localhost:5173';

        return implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' $vite https://js.stripe.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "connect-src 'self' $api $vite ws://localhost:5173",
            "frame-ancestors 'none'",
            "frame-src https://js.stripe.com",
            "media-src 'self' blob:",
            "base-uri 'self'",
            "form-action 'self'",
        ]);
    }

    private function prodCsp(): string
    {
        $appUrl = config('app.url');
        $host   = parse_url($appUrl, PHP_URL_SCHEME) . '://' . parse_url($appUrl, PHP_URL_HOST);

        return implode('; ', [
            "default-src 'self'",
            "script-src 'self' https://js.stripe.com",
            "style-src 'self'",
            "img-src 'self' data:",
            "font-src 'self' data:",
            "connect-src 'self' $host",
            "frame-ancestors 'none'",
            "frame-src https://js.stripe.com",
            "media-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
        ]);
    }
}
