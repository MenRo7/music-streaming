<?php

namespace App\Mail;

use Resend;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;

class ResendTransport extends AbstractTransport
{
    protected $resend;

    public function __construct()
    {
        parent::__construct();
        $this->resend = Resend::client(config('services.resend.key'));
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $this->resend->emails->send([
            'from' => $email->getFrom()[0]->getAddress(),
            'to' => array_map(fn($addr) => $addr->getAddress(), $email->getTo()),
            'subject' => $email->getSubject(),
            'html' => $email->getHtmlBody(),
        ]);
    }

    public function __toString(): string
    {
        return 'resend';
    }
}
