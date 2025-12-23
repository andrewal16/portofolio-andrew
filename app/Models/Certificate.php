<?php

namespace App\Models;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model; // Import Facade
use Illuminate\Support\Facades\Log;

class Certificate extends Model
{
    use HasFactory;

    // Hapus konstanta STORAGE_DISK karena kita pakai Cloudinary
    // private const STORAGE_DISK = 'public';

    protected $fillable = [
        'name',
        'issuer',
        'issued_at',
        'credential_id',
        'credential_url',
        'image_url',
    ];

    protected $casts = [
        'issued_at' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ==================== Relationships ====================

    public function tags()
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    // ==================== Scopes ====================

    public function scopeByIssuer($query, string $issuer)
    {
        return $query->where('issuer', $issuer);
    }

    public function scopeByYear($query, int $year)
    {
        return $query->whereYear('issued_at', $year);
    }

    public function scopeByTag($query, $tagId)
    {
        return $query->whereHas('tags', function ($q) use ($tagId) {
            $q->where('tags.id', $tagId);
        });
    }

    public function scopeLatestIssued($query)
    {
        return $query->orderBy('issued_at', 'desc');
    }

    // ==================== Accessors ====================

    /**
     * Get full URL.
     * Karena sekarang kita simpan full URL di DB, logic ini jadi simpel.
     */
    public function getImageFullUrlAttribute(): ?string
    {
        return $this->image_url;
    }

    public function getIssuedYearAttribute(): int
    {
        return $this->issued_at->year;
    }

    /**
     * Check apakah ada gambar certificate.
     */
    public function hasImage(): bool
    {
        return ! empty($this->image_url);
    }

    // ==================== Events (Auto Delete Cloudinary) ====================

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($certificate) {
            if ($certificate->image_url) {
                try {
                    // ✅ FIX: Add null check untuk parse_url
                    $path = parse_url($certificate->image_url, PHP_URL_PATH);

                    if (! $path) {
                        Log::warning("Failed to parse URL on delete: {$certificate->image_url}");

                        return;
                    }

                    // Logic untuk mengambil Public ID dari URL Cloudinary
                    if (str_contains($path, 'certificates/')) {
                        preg_match('/(certificates\/[^\.]+)/', $path, $matches);

                        if (isset($matches[1])) {
                            $publicId = $matches[1];
                            Cloudinary::destroy($publicId);
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Gagal hapus gambar Cloudinary saat delete certificate: '.$e->getMessage());
                }
            }
        });
    }
}
