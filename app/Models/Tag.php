<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'color',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ==================== Relationships ====================

    /**
     * Tag punya banyak certificates (many-to-many).
     */
    public function certificates()
    {
        return $this->belongsToMany(Certificate::class)
            ->withTimestamps();
    }

    // ==================== Scopes ====================

    /**
     * Search tag by name or slug.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where('name', 'like', "%{$term}%")
            ->orWhere('slug', 'like', "%{$term}%");
    }

    // ==================== Accessors ====================

    /**
     * Get jumlah certificates dengan tag ini.
     */
    public function getCertificatesCountAttribute(): int
    {
        return $this->certificates()->count();
    }

    // ==================== Events ====================

    protected static function boot()
    {
        parent::boot();

        // Auto-generate slug saat creating
        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);

                // Pastikan slug unik
                $originalSlug = $tag->slug;
                $count = 1;

                while (static::where('slug', $tag->slug)->exists()) {
                    $tag->slug = "{$originalSlug}-{$count}";
                    $count++;
                }
            }
        });
    }

    // ==================== Route Binding ====================

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
