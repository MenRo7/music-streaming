<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OneTimeCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $code;

    public string $purpose;

    /**
     * @param string $code    Code à 6 caractères
     * @param string $purpose 'Vérification e-mail' | 'Connexion'
     */
    public function __construct(string $code, string $purpose = 'Code')
    {
        $this->code = $code;
        $this->purpose = $purpose;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Votre code {$this->purpose}"
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.one-time-code',
            with: [
                'code' => $this->code,
                'purpose' => $this->purpose,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
