<?php

namespace App\Console\Commands;

use App\Models\Experience;
use Illuminate\Console\Command;

class CheckGalleryPaths extends Command
{
    protected $signature = 'check:gallery-paths';

    protected $description = 'Check what paths are stored in experience gallery fields';

    public function handle()
    {
        $this->info('🔍 CHECKING GALLERY PATHS IN DATABASE');
        $this->info('=====================================');
        $this->newLine();

        $experiences = Experience::whereNotNull('gallery')->get();

        if ($experiences->isEmpty()) {
            $this->warn('No experiences with gallery data found.');

            return;
        }

        $this->info("Found {$experiences->count()} experience(s) with gallery data");
        $this->newLine();

        foreach ($experiences as $exp) {
            $this->info("📁 {$exp->company_name} - {$exp->position}");
            $this->info("   Slug: {$exp->slug}");

            if (! is_array($exp->gallery)) {
                $this->warn('   ⚠️  Gallery is not an array!');
                $this->line('   Type: '.gettype($exp->gallery));
                $this->newLine();

                continue;
            }

            $this->info('   Gallery items: '.count($exp->gallery));

            foreach ($exp->gallery as $index => $path) {
                $this->line("   [{$index}] {$path}");

                // Detect disk type
                if (str_contains($path, 'cloudinary://')) {
                    $this->error('       ❌ CLOUDINARY PATH DETECTED!');
                } elseif (str_starts_with($path, 'experiences/')) {
                    $this->info('       ✅ Local storage path (correct)');
                } elseif (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    $this->warn('       ⚠️  Full URL detected (unusual)');
                } else {
                    $this->warn('       ⚠️  Unknown format');
                }
            }

            $this->newLine();
        }

        $this->info('💡 RECOMMENDATIONS:');
        $this->info('===================');
        $this->info('• If Cloudinary paths found: Run migrate:gallery-to-local');
        $this->info('• If local paths: Check storage link and permissions');
        $this->info('• If full URLs: May need to re-upload images');
    }
}
