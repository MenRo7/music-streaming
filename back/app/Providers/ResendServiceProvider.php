<?php

namespace App\Providers;

use App\Mail\ResendTransport;
use Illuminate\Mail\MailManager;
use Illuminate\Support\ServiceProvider;

class ResendServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->app->extend('mail.manager', function (MailManager $manager) {
            $manager->extend('resend', function () {
                return new ResendTransport();
            });

            return $manager;
        });
    }
}
