<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    //
    protected $fillable = [
        'project_id',
        'title',
        'slug',
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

    protected static function boot(): void
    {
        parent::boot();

        // Auto-generate slug saat create
        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);

                // Pastikan slug unique
                $originalSlug = $post->slug;
                $count = 1;
                while (static::where('slug', $post->slug)->exists()) {
                    $post->slug = "{$originalSlug}-{$count}";
                    $count++;
                }
            }

            // Set published_at otomatis saat is_published true
            if ($post->is_published && !$post->published_at) {
                $post->published_at = now();
            }
        });

        // Update slug saat title berubah
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

            // Set published_at saat pertama kali dipublish
            if ($post->isDirty('is_published') && $post->is_published && !$post->published_at) {
                $post->published_at = now();
            }

            // Unset published_at saat unpublish
            if ($post->isDirty('is_published') && !$post->is_published) {
                $post->published_at = null;
            }
        });
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
    public function scopePublished($query)
    {
        return $query->where('is_published', true)->whereNotNull('published_at');
    }
    public function scopeDraft($query)
    {
        return $query->where('is_published', false);
    }
    public function getIsDraftAttribute(): bool
    {
        return !$this->is_published;
    }
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
