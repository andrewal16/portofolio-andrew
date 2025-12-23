<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    protected $fillable = [
        'project_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    // ==========================================
    // QUERY SCOPES (✅ TAMBAHAN BARU)
    // ==========================================

    /**
     * ✅ SUPER PENTING: Eager load project dengan kolom yang dibutuhkan SAJA
     * Ini menghindari N+1 dan lebih hemat memory
     */
    public function scopeWithProjectData($query)
    {
        return $query->with('project:id,title,slug,thumbnail_url');
    }

    /**
     * Filter hanya blog yang sudah published
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->whereNotNull('published_at');
    }

    /**
     * Filter hanya blog yang masih draft
     */
    public function scopeDraft($query)
    {
        return $query->where('is_published', false);
    }

    /**
     * Filter blog berdasarkan project ID
     */
    public function scopeByProject($query, int $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    /**
     * Urutkan dari yang terbaru berdasarkan published_at
     */
    public function scopeLatestPublished($query)
    {
        return $query->orderBy('published_at', 'desc');
    }

    // ==========================================
    // ACCESSORS
    // ==========================================

    public function getIsDraftAttribute(): bool
    {
        return ! $this->is_published;
    }

    /**
     * ✅ TAMBAHAN: Hitung read time otomatis
     */
    public function getReadTimeAttribute(): int
    {
        $wordCount = str_word_count(strip_tags($this->content));

        return max(1, ceil($wordCount / 200)); // Minimal 1 menit
    }

    // ==========================================
    // ROUTING
    // ==========================================

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // ==========================================
    // BOOT EVENTS
    // ==========================================

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);

                $originalSlug = $post->slug;
                $count = 1;
                while (static::where('slug', $post->slug)->exists()) {
                    $post->slug = "{$originalSlug}-{$count}";
                    $count++;
                }
            }

            if ($post->is_published && ! $post->published_at) {
                $post->published_at = now();
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('title')) {
                $newSlug = Str::slug($post->title);

                if ($newSlug !== $post->slug) {
                    $originalSlug = $newSlug;
                    $count = 1;

                    while (static::where('slug', $newSlug)
                        ->where('id', '!=', $post->id)
                        ->exists()) {
                        $newSlug = "{$originalSlug}-{$count}";
                        $count++;
                    }

                    $post->slug = $newSlug;
                }
            }

            if ($post->isDirty('is_published') && $post->is_published && ! $post->published_at) {
                $post->published_at = now();
            }

            if ($post->isDirty('is_published') && ! $post->is_published) {
                $post->published_at = null;
            }
        });
    }
}
