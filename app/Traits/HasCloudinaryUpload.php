<?php

namespace App\Traits;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Log;

trait HasCloudinaryUpload
{
    public function uploadToCloudinary($file, $folder)
    {
        try {
            return $file->storeOnCloudinary($folder)->getSecurePath();
        } catch (\Exception $e) {
            Log::error("Cloudinary Upload Failed: " . $e->getMessage());
            return null;
        }
    }

    public function deleteFromCloudinary($url, $folder)
    {
        if (!$url || !str_contains($url, 'cloudinary.com')) return;

        try {
            $path = parse_url($url, PHP_URL_PATH);
            preg_match("/({$folder}\/[^\.]+)/", $path, $matches);
            
            if (isset($matches[1])) {
                Cloudinary::destroy($matches[1]);
            }
        } catch (\Exception $e) {
            Log::error("Cloudinary Delete Failed: " . $e->getMessage());
        }
    }
}