<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Experience extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'company_name',
        'company_logo',
        'position',
        'employment_type',
        'start_date',
        'end_date',
        'description',
        'detailed_description',
        'location',
        'is_remote',
        'key_achievements',
        'metrics',
        'tech_stack',
        'gallery',
        'meta_title',
        'meta_description',
        'is_featured',
        'is_published',
        'display_order',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'key_achievements' => 'array',
        'metrics' => 'array',
        'tech_stack' => 'array',
        'gallery' => 'array',
        'is_remote' => 'boolean',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
    ];

    protected $appends = [
        'formatted_duration',
        'duration_in_months',
        'is_current',
        'display_date',
        'gallery_urls', // ✅ NEW: Full URLs untuk gallery
    ];

    /**
     * Boot method - auto generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($experience) {
            if (empty($experience->slug)) {
                $experience->slug = Str::slug($experience->company_name.'-'.$experience->position);
            }
        });
    }

    /**
     * Scope: Only published experiences
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope: Featured experiences
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: Order by timeline (newest first)
     */
    public function scopeTimeline($query)
    {
        return $query->orderBy('start_date', 'desc')
            ->orderBy('display_order', 'asc');
    }

    /**
     * Accessor: Check if currently working
     */
    public function getIsCurrentAttribute()
    {
        return $this->end_date === null;
    }

    /**
     * Accessor: Formatted duration string
     * Example: "March 2024 - Present" or "Oct 2022 - Feb 2024"
     */
    public function getFormattedDurationAttribute()
    {
        $start = $this->start_date->format('M Y');
        $end = $this->is_current ? 'Present' : $this->end_date->format('M Y');

        return "{$start} - {$end}";
    }

    /**
     * ✅ FIXED: Calculate duration in months (properly rounded)
     */
    public function getDurationInMonthsAttribute()
    {
        $end = $this->is_current ? now() : $this->end_date;

        // Calculate total months
        $months = $this->start_date->diffInMonths($end);

        // If less than 1 month, check days
        if ($months < 1) {
            $days = $this->start_date->diffInDays($end);

            return $days > 0 ? 1 : 0; // Minimum 1 month if there's any duration
        }

        // Round to 1 decimal place for partial months
        $totalMonths = $this->start_date->floatDiffInMonths($end);

        return round($totalMonths, 1);
    }

    /**
     * Accessor: Display date for timeline (year grouping)
     */
    public function getDisplayDateAttribute()
    {
        return $this->start_date->format('Y');
    }

    /**
     * ✅ NEW: Get gallery images with full storage URLs
     */
    public function getGalleryUrlsAttribute()
    {
        if (! $this->gallery || ! is_array($this->gallery)) {
            return [];
        }

        return array_map(function ($path) {
            return asset('storage/'.$path);
        }, $this->gallery);
    }

    /**
     * Get employment type label (for badges)
     */
    public function getEmploymentTypeLabel()
    {
        return match ($this->employment_type) {
            'full-time' => 'Full Time',
            'part-time' => 'Part Time',
            'contract' => 'Contract',
            'internship' => 'Internship',
            'freelance' => 'Freelance',
            default => 'Other',
        };
    }

    /**
     * Get employment type color (untuk UI badges)
     */
    public function getEmploymentTypeColor()
    {
        return match ($this->employment_type) {
            'full-time' => 'green',
            'part-time' => 'blue',
            'contract' => 'cyan',
            'internship' => 'purple',
            'freelance' => 'orange',
            default => 'gray',
        };
    }
}
