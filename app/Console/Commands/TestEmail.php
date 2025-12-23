<?php

namespace App\Console\Commands;

use App\Mail\ContactFormMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'test:email';

    protected $description = 'Test email configuration';

    public function handle()
    {
        $this->info('Testing email configuration...');

        $testData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+62 812 3456 7890',
            'message' => 'This is a test message from portfolio contact form.',
            'ip_address' => '127.0.0.1',
        ];

        try {
            Mail::to(config('mail.from.address'))
                ->send(new ContactFormMail($testData));

            $this->info('✅ Email sent successfully!');

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Email failed: '.$e->getMessage());

            return 1;
        }
    }
}
