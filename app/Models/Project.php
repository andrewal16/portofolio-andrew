<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory;

   protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'thumbnail_url',
        'technologies', // ✅ TAMBAH
        'demo_url',
        'repo_url',
        'started_at',
        'finished_at',
        'status',
        'type',
    ];

    protected $casts = [
        'technologies' => 'array', // ✅ Otomatis convert JSON ↔ Array
        'started_at' => 'date',
        'finished_at' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = Str::slug($project->title);

                $originalSlug = $project->slug;
                $count = 1;
                while (static::where('slug', $project->slug)->exists()) {
                    $project->slug = $originalSlug . '-' . $count;
                    $count++;
                }
            }
        });

        static::updating(function ($project) {
            if ($project->isDirty('title')) {
                $newSlug = Str::slug($project->title);

                if ($newSlug !== $project->slug) {
                    $originalSlug = $newSlug;
                    $count = 1;

                    while (static::where('slug', $newSlug)
                        ->where('id', '!=', $project->id)
                        ->exists()) {
                        $newSlug = "{$originalSlug}-{$count}";
                        $count++;
                    }

                    $project->slug = $newSlug;
                }
            }
        });

        // ✅ BARU: Hapus file thumbnail lama saat delete
        static::deleting(function ($project) {
            if ($project->thumbnail_url) {
                Storage::disk('public')->delete($project->thumbnail_url);
            }
        });
    }

    public function blogPosts():HasMany
    {
        return $this->hasMany(BlogPost::class);
    }

    public function publishedBlogPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class)
            ->where('is_published', true)
            ->whereNotNull('published_at')
            ->latest('published_at');
    }

    // ✅ BARU: Accessor untuk full URL thumbnail
    public function getThumbnailFullUrlAttribute(): ?string
    {
        if (!$this->thumbnail_url) {
            return null;
        }

        // Kalau sudah full URL (http/https), return aja
        if (filter_var($this->thumbnail_url, FILTER_VALIDATE_URL)) {
            return $this->thumbnail_url;
        }

        // Kalau path storage, convert ke URL
        return Storage::disk('public')->url($this->thumbnail_url);
    }

    public function scopeOngoing($query)
    {
        return $query->where('status', 'ongoing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getDurationDaysAttribute(): ?int
    {
        if (!$this->finished_at) {
            return null;
        }

        return $this->started_at->diffInDays($this->finished_at);
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
