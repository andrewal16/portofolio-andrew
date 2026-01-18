<?php

namespace App\Models;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Certificate extends Model
{
    use HasFactory;

    // ✅ Category Constants
    const CATEGORY_LEARNING = 'learning';
    const CATEGORY_COMPETITION = 'competition';

    protected $fillable = [
        'name',
        'issuer',
        'issued_at',
        'credential_id',
        'credential_url',
        'image_url',
        'display_order',  // ✅ NEW
        'category',       // ✅ NEW
    ];

    protected $casts = [
        'issued_at' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'category_label',
        'category_color',
    ];

    // ==================== BOOT ====================
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($certificate) {
            // Auto set display_order
            if (empty($certificate->display_order)) {
                $certificate->display_order = static::max('display_order') + 1;
            }
            
            // Default category
            if (empty($certificate->category)) {
                $certificate->category = self::CATEGORY_LEARNING;
            }
        });

        static::deleting(function ($certificate) {
            if ($certificate->image_url) {
                try {
                    $path = parse_url($certificate->image_url, PHP_URL_PATH);
                    if (!$path) return;

                    if (str_contains($path, 'certificates/')) {
                        preg_match('/(certificates\/[^\.]+)/', $path, $matches);
                        if (isset($matches[1])) {
                            Cloudinary::destroy($matches[1]);
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Gagal hapus gambar Cloudinary: ' . $e->getMessage());
                }
            }
        });
    }

    // ==================== RELATIONSHIPS ====================
    public function tags()
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    // ==================== SCOPES ====================
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order', 'asc');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeLearning($query)
    {
        return $query->where('category', self::CATEGORY_LEARNING);
    }

    public function scopeCompetition($query)
    {
        return $query->where('category', self::CATEGORY_COMPETITION);
    }

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
        return $query->whereHas('tags', fn($q) => $q->where('tags.id', $tagId));
    }

    public function scopeLatestIssued($query)
    {
        return $query->orderBy('issued_at', 'desc');
    }

    // ==================== ACCESSORS ====================
    public function getImageFullUrlAttribute(): ?string
    {
        return $this->image_url;
    }

    public function getIssuedYearAttribute(): int
    {
        return $this->issued_at->year;
    }

    public function getCategoryLabelAttribute(): string
    {
        return match($this->category) {
            self::CATEGORY_LEARNING => 'Learning',
            self::CATEGORY_COMPETITION => 'Competition',
            default => 'Other',
        };
    }

    public function getCategoryColorAttribute(): string
    {
        return match($this->category) {
            self::CATEGORY_LEARNING => 'blue',
            self::CATEGORY_COMPETITION => 'gold',
            default => 'default',
        };
    }

    // ==================== HELPERS ====================
    public function hasImage(): bool
    {
        return !empty($this->image_url);
    }

    public static function getCategoryOptions(): array
    {
        return [
            ['value' => self::CATEGORY_LEARNING, 'label' => 'Learning / Course'],
            ['value' => self::CATEGORY_COMPETITION, 'label' => 'Competition / Award'],
        ];
    }
}