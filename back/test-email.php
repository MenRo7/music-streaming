<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;

try {
    echo "📧 Testing Resend email...\n\n";

    // Test d'envoi d'email
    Mail::raw('Ceci est un email de test envoyé depuis Rhapsody via Resend!', function ($message) {
        $message->to('votre-email@example.com')  // Remplacez par votre email
                ->subject('Test Resend - Rhapsody');
    });

    echo "✅ Email envoyé avec succès!\n";
    echo "Vérifiez votre boîte mail (et les spams).\n\n";

    // Afficher la configuration mail
    echo "Configuration actuelle:\n";
    echo "- MAIL_MAILER: " . config('mail.default') . "\n";
    echo "- MAIL_FROM_ADDRESS: " . config('mail.from.address') . "\n";
    echo "- MAIL_FROM_NAME: " . config('mail.from.name') . "\n";
    echo "- RESEND_KEY: " . (config('services.resend.key') ? 'Configuré ✓' : 'Non configuré ✗') . "\n";

} catch (\Exception $e) {
    echo "❌ Erreur lors de l'envoi de l'email:\n";
    echo $e->getMessage() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}
