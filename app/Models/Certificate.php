<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Certificate extends Model
{
    use HasFactory;

    /**
     * Storage disk untuk gambar certificate.
     */
    private const STORAGE_DISK = 'public';
    private const IMAGE_PATH = 'certificates/images';

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

    /**
     * Certificate punya banyak tags (many-to-many).
     */
    public function tags()
    {
        return $this->belongsToMany(Tag::class)
            ->withTimestamps(); // Simpan created_at di pivot table
    }

    // ==================== Scopes ====================

    /**
     * Filter berdasarkan issuer.
     */
    public function scopeByIssuer($query, string $issuer)
    {
        return $query->where('issuer', $issuer);
    }

    /**
     * Filter berdasarkan tahun.
     */
    public function scopeByYear($query, int $year)
    {
        return $query->whereYear('issued_at', $year);
    }

    /**
     * Filter berdasarkan tag.
     */
    public function scopeByTag($query, $tagId)
    {
        return $query->whereHas('tags', function ($q) use ($tagId) {
            $q->where('tags.id', $tagId);
        });
    }

    /**
     * Urutkan dari yang terbaru.
     */
    public function scopeLatestIssued($query)
    {
        return $query->orderBy('issued_at', 'desc');
    }

    // ==================== Accessors ====================

    /**
     * Get full URL untuk gambar certificate.
     */
    public function getImageFullUrlAttribute(): ?string
    {
        if (!$this->image_url) {
            return null;
        }

        // Kalau sudah full URL (external)
        if (filter_var($this->image_url, FILTER_VALIDATE_URL)) {
            return $this->image_url;
        }

        // Generate URL dari Storage
        return Storage::disk(self::STORAGE_DISK)->url($this->image_url);
    }

    /**
     * Get tahun terbit certificate.
     */
    public function getIssuedYearAttribute(): int
    {
        return $this->issued_at->year;
    }

    /**
     * Check apakah ada gambar certificate.
     */
    public function hasImage(): bool
    {
        if (!$this->image_url) {
            return false;
        }

        if (filter_var($this->image_url, FILTER_VALIDATE_URL)) {
            return true;
        }

        return Storage::disk(self::STORAGE_DISK)->exists($this->image_url);
    }

    // ==================== Events ====================

    protected static function boot()
    {
        parent::boot();

        // Hapus gambar certificate saat dihapus
        static::deleting(function ($certificate) {
            if ($certificate->image_url && !filter_var($certificate->image_url, FILTER_VALIDATE_URL)) {
                Storage::disk(self::STORAGE_DISK)->delete($certificate->image_url);
            }
        });
    }
}
