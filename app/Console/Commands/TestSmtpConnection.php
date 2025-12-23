<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestSmtpConnection extends Command
{
    protected $signature = 'test:smtp';

    protected $description = 'Test SMTP connection and configuration';

    public function handle()
    {
        $this->info('🔧 Testing SMTP Configuration...');
        $this->newLine();

        // 1. Show current configuration
        $this->info('📋 Current Mail Configuration:');
        $this->table(
            ['Setting', 'Value'],
            [
                ['MAIL_MAILER', config('mail.default')],
                ['MAIL_HOST', config('mail.mailers.smtp.host')],
                ['MAIL_PORT', config('mail.mailers.smtp.port')],
                ['MAIL_USERNAME', config('mail.mailers.smtp.username')],
                ['MAIL_ENCRYPTION', config('mail.mailers.smtp.encryption')],
                ['MAIL_FROM_ADDRESS', config('mail.from.address')],
                ['MAIL_FROM_NAME', config('mail.from.name')],
            ]
        );
        $this->newLine();

        // 2. Test connection
        $this->info('🔌 Testing SMTP Connection...');

        try {
            $transport = Mail::mailer()->getSymfonyTransport();

            $this->info('✅ SMTP Connection: OK');
            $this->newLine();

            // 3. Send test email
            if ($this->confirm('Do you want to send a test email?', true)) {
                $this->info('📧 Sending test email...');

                Mail::raw('This is a test email from your Laravel portfolio.', function ($message) {
                    $message->to(config('mail.from.address'))
                        ->subject('🧪 Test Email - Portfolio Contact Form');
                });

                $this->info('✅ Test email sent successfully!');
                $this->info('📬 Check your inbox: '.config('mail.from.address'));
            }

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ SMTP Connection Failed!');
            $this->error('Error: '.$e->getMessage());
            $this->newLine();

            $this->warn('🔍 Possible solutions:');
            $this->line('1. Check your .env file configuration');
            $this->line('2. Verify Gmail App Password is correct');
            $this->line('3. Enable "Less secure app access" in Gmail');
            $this->line('4. Check if 2-Step Verification is enabled');
            $this->line('5. Try clearing config cache: php artisan config:clear');

            return 1;
        }
    }
}
