<?php

namespace App\Models;

use Cloudinary\Cloudinary as CloudinarySDK;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'thumbnail_url',
        'technologies',
        'demo_url',
        'repo_url',
        'started_at',
        'finished_at',
        'status',
        'type',
        'display_order', // ✅ NEW
    ];

    protected $casts = [
        'technologies' => 'array',
        'started_at' => 'date',
        'finished_at' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ==================== BOOT ====================
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
            
            // ✅ Auto set display_order
            if (empty($project->display_order)) {
                $project->display_order = static::max('display_order') + 1;
            }
        });

        static::updating(function ($project) {
            if ($project->isDirty('title')) {
                $newSlug = Str::slug($project->title);
                if ($newSlug !== $project->slug) {
                    $originalSlug = $newSlug;
                    $count = 1;
                    while (static::where('slug', $newSlug)->where('id', '!=', $project->id)->exists()) {
                        $newSlug = "{$originalSlug}-{$count}";
                        $count++;
                    }
                    $project->slug = $newSlug;
                }
            }
        });

        static::deleting(function ($project) {
            if (!$project->thumbnail_url) return;
            if (!str_contains($project->thumbnail_url, 'cloudinary.com')) return;

            try {
                $path = parse_url($project->thumbnail_url, PHP_URL_PATH);
                if (!$path) return;

                if (str_contains($path, 'projects/')) {
                    preg_match('/(projects\/[^\.]+)/', $path, $matches);
                    if (isset($matches[1])) {
                        $publicId = $matches[1];
                        $cloudinary = new CloudinarySDK([
                            'cloud' => [
                                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                                'api_key' => env('CLOUDINARY_API_KEY'),
                                'api_secret' => env('CLOUDINARY_API_SECRET'),
                            ]
                        ]);
                        $cloudinary->uploadApi()->destroy($publicId);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Cloudinary auto-delete failed: ' . $e->getMessage());
            }
        });
    }

    // ==================== RELATIONSHIPS ====================
    public function blogPosts(): HasMany
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

    // ==================== SCOPES ====================
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order', 'asc');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
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

    public function scopeWithTechnology($query, string $technology)
    {
        return $query->whereJsonContains('technologies', $technology);
    }

    // ==================== ACCESSORS ====================
    public function getThumbnailFullUrlAttribute(): ?string
    {
        if (!$this->thumbnail_url) return null;
        if (filter_var($this->thumbnail_url, FILTER_VALIDATE_URL)) {
            return $this->thumbnail_url;
        }
        $localPath = storage_path('app/public/' . $this->thumbnail_url);
        if (file_exists($localPath)) {
            return asset('storage/' . $this->thumbnail_url);
        }
        return null;
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getDurationDaysAttribute(): ?int
    {
        if (!$this->finished_at || !$this->started_at) return null;
        return $this->started_at->diffInDays($this->finished_at);
    }

    // ==================== HELPERS ====================
    public function hasThumbnail(): bool
    {
        return !empty($this->thumbnail_url);
    }

    public function hasDemo(): bool
    {
        return !empty($this->demo_url);
    }

    public function hasRepo(): bool
    {
        return !empty($this->repo_url);
    }

    public function usesTechnology(string $technology): bool
    {
        return is_array($this->technologies) && in_array($technology, $this->technologies);
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    // ==================== STATIC HELPERS ====================
    public static function getAvailableTypes(): array
    {
        return static::whereNotNull('type')
            ->where('type', '!=', '')
            ->distinct()
            ->pluck('type')
            ->toArray();
    }
}