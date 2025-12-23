<?php

namespace App\Console\Commands;

use App\Models\Project;
use Cloudinary\Cloudinary as CloudinarySDK;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateProjectsToCloudinary extends Command
{
    protected $signature = 'projects:migrate-cloudinary';
    protected $description = 'Migrate existing project thumbnails to Cloudinary';

    public function handle()
    {
        $projects = Project::whereNotNull('thumbnail_url')
            ->where('thumbnail_url', 'NOT LIKE', '%cloudinary.com%')
            ->get();

        if ($projects->isEmpty()) {
            $this->info('✅ Tidak ada project yang perlu dimigrate.');
            return;
        }

        $this->info("🔄 Migrasi {$projects->count()} project ke Cloudinary...");

        $cloudinary = new CloudinarySDK([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key' => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ]
        ]);

        foreach ($projects as $project) {
            try {
                $localPath = storage_path('app/public/' . $project->thumbnail_url);

                if (!file_exists($localPath)) {
                    $this->warn("⚠️  File tidak ditemukan: {$project->title}");
                    continue;
                }

                $fileName = $project->slug . '-' . time();

                $result = $cloudinary->uploadApi()->upload($localPath, [
                    'folder' => 'projects',
                    'public_id' => $fileName,
                    'resource_type' => 'image',
                ]);

                // Update database
                $project->update([
                    'thumbnail_url' => $result['secure_url']
                ]);

                // Hapus file lokal
                Storage::disk('public')->delete($project->thumbnail_url);

                $this->info("✅ Migrated: {$project->title}");

            } catch (\Exception $e) {
                $this->error("❌ Error: {$project->title} - {$e->getMessage()}");
            }
        }

        $this->info('🎉 Migrasi selesai!');
    }
}