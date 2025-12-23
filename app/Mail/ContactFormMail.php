<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contactData;

    public function __construct(array $contactData)
    {
        $this->contactData = $contactData;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                $this->contactData['email'],
                $this->contactData['name']
            ),
            replyTo: [
                new Address($this->contactData['email'], $this->contactData['name']),
            ],
            subject: '🚀 New Contact Form Submission - Portfolio',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-form',
            with: [
                'name' => $this->contactData['name'],
                'email' => $this->contactData['email'],
                'phone' => $this->contactData['phone'] ?? 'Not provided',
                'messageContent' => $this->contactData['message'],
                'submittedAt' => now()->format('F d, Y - H:i:s'),
                'ipAddress' => $this->contactData['ip_address'] ?? 'Unknown',
            ],
        );
    }
}
