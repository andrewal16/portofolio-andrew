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

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
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
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'technologies' => 'array', // Auto convert JSON ↔ Array
        'started_at' => 'date',
        'finished_at' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The model's boot method.
     */
    protected static function boot()
    {
        parent::boot();

        // ==================== AUTO SLUG ON CREATE ====================
        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = Str::slug($project->title);

                // Cek duplicate slug
                $originalSlug = $project->slug;
                $count = 1;
                
                while (static::where('slug', $project->slug)->exists()) {
                    $project->slug = $originalSlug . '-' . $count;
                    $count++;
                }
            }
        });

        // ==================== AUTO SLUG ON UPDATE ====================
        static::updating(function ($project) {
            if ($project->isDirty('title')) {
                $newSlug = Str::slug($project->title);

                if ($newSlug !== $project->slug) {
                    $originalSlug = $newSlug;
                    $count = 1;

                    // Cek duplicate slug (exclude current project)
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

        // ==================== AUTO DELETE CLOUDINARY IMAGE ====================
        static::deleting(function ($project) {
            if (!$project->thumbnail_url) {
                return;
            }

            // HANYA delete jika URL Cloudinary
            if (!str_contains($project->thumbnail_url, 'cloudinary.com')) {
                Log::info('Skipping auto-delete: Not a Cloudinary URL', [
                    'project_id' => $project->id,
                    'url' => $project->thumbnail_url
                ]);
                return;
            }

            try {
                // Parse URL
                $path = parse_url($project->thumbnail_url, PHP_URL_PATH);
                
                if (!$path) {
                    Log::warning('Failed to parse URL during auto-delete', [
                        'project_id' => $project->id,
                        'url' => $project->thumbnail_url
                    ]);
                    return;
                }

                // Extract public ID jika ada folder 'projects/'
                if (str_contains($path, 'projects/')) {
                    preg_match('/(projects\/[^\.]+)/', $path, $matches);

                    if (isset($matches[1])) {
                        $publicId = $matches[1];
                        
                        // Get credentials
                        $cloudName = env('CLOUDINARY_CLOUD_NAME');
                        $apiKey = env('CLOUDINARY_API_KEY');
                        $apiSecret = env('CLOUDINARY_API_SECRET');

                        if (!$cloudName || !$apiKey || !$apiSecret) {
                            Log::error('Cloudinary credentials not set for auto-delete');
                            return;
                        }

                        // Initialize Cloudinary
                        $cloudinary = new CloudinarySDK([
                            'cloud' => [
                                'cloud_name' => $cloudName,
                                'api_key' => $apiKey,
                                'api_secret' => $apiSecret,
                            ]
                        ]);
                        
                        // Delete dari Cloudinary
                        $cloudinary->uploadApi()->destroy($publicId);
                        
                        Log::info('Cloudinary auto-delete successful', [
                            'project_id' => $project->id,
                            'public_id' => $publicId
                        ]);
                    }
                }
            } catch (\Exception $e) {
                // CRITICAL: Log tapi JANGAN throw exception
                // Delete model HARUS tetap jalan walaupun Cloudinary gagal
                Log::error('Cloudinary auto-delete failed during model deletion', [
                    'project_id' => $project->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        });
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get all blog posts for this project.
     */
    public function blogPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class);
    }

    /**
     * Get only published blog posts for this project.
     */
    public function publishedBlogPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class)
            ->where('is_published', true)
            ->whereNotNull('published_at')
            ->latest('published_at');
    }

    // ==================== ACCESSORS ====================

    /**
     * Get full URL untuk thumbnail
     * Support untuk Cloudinary dan local storage (backward compatibility)
     *
     * @return string|null
     */
    public function getThumbnailFullUrlAttribute(): ?string
    {
        // Kalau kosong, return null
        if (!$this->thumbnail_url) {
            return null;
        }

        // Kalau sudah full URL (Cloudinary), return langsung
        if (filter_var($this->thumbnail_url, FILTER_VALIDATE_URL)) {
            return $this->thumbnail_url;
        }

        // Fallback: untuk backward compatibility dengan storage lokal
        // (kalau ada data lama yang belum migrate)
        $localPath = storage_path('app/public/' . $this->thumbnail_url);
        if (file_exists($localPath)) {
            return asset('storage/' . $this->thumbnail_url);
        }

        return null;
    }

    /**
     * Check if project is completed
     *
     * @return bool
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Get project duration in days
     *
     * @return int|null
     */
    public function getDurationDaysAttribute(): ?int
    {
        if (!$this->finished_at || !$this->started_at) {
            return null;
        }

        return $this->started_at->diffInDays($this->finished_at);
    }

    /**
     * Check if project has thumbnail
     *
     * @return bool
     */
    public function hasThumbnail(): bool
    {
        return !empty($this->thumbnail_url);
    }

    // ==================== SCOPES ====================

    /**
     * Scope query untuk ongoing projects
     */
    public function scopeOngoing($query)
    {
        return $query->where('status', 'ongoing');
    }

    /**
     * Scope query untuk completed projects
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope query untuk upcoming projects
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    /**
     * Scope query untuk projects dengan technology tertentu
     */
    public function scopeWithTechnology($query, string $technology)
    {
        return $query->whereJsonContains('technologies', $technology);
    }

    /**
     * Scope query untuk projects yang sudah punya demo URL
     */
    public function scopeWithDemo($query)
    {
        return $query->whereNotNull('demo_url');
    }

    /**
     * Scope query untuk projects yang sudah punya repo URL
     */
    public function scopeWithRepo($query)
    {
        return $query->whereNotNull('repo_url');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if project has demo URL
     *
     * @return bool
     */
    public function hasDemo(): bool
    {
        return !empty($this->demo_url);
    }

    /**
     * Check if project has repository URL
     *
     * @return bool
     */
    public function hasRepo(): bool
    {
        return !empty($this->repo_url);
    }

    /**
     * Check if project uses specific technology
     *
     * @param string $technology
     * @return bool
     */
    public function usesTechnology(string $technology): bool
    {
        if (!is_array($this->technologies)) {
            return false;
        }

        return in_array($technology, $this->technologies);
    }

    // ==================== ROUTE MODEL BINDING ====================

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }
}