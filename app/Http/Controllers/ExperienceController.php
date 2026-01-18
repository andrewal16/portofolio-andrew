<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ExperienceController extends Controller
{
    /**
     * Display a listing of experiences (Admin)
     */
    public function index()
    {
        $experiences = Experience::orderBy('display_order', 'asc')
            ->orderBy('start_date', 'desc')
            ->paginate(50) // Increase limit untuk drag & drop
            ->through(function ($exp) {
                return [
                    'id' => $exp->id,
                    'slug' => $exp->slug,
                    'company_name' => $exp->company_name,
                    'company_logo' => $exp->company_logo,
                    'position' => $exp->position,
                    'employment_type' => $exp->employment_type,
                    'employment_type_label' => $exp->getEmploymentTypeLabel(),
                    'formatted_duration' => $exp->formatted_duration,
                    'is_current' => $exp->is_current,
                    'is_featured' => $exp->is_featured,
                    'is_published' => $exp->is_published,
                    'display_order' => $exp->display_order,
                ];
            });

        return Inertia::render('Admin/Experience/Index', [
            'experiences' => $experiences,
        ]);
    }

    /**
     * ✅ NEW: Batch update display order (for drag & drop)
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:experiences,id',
            'items.*.display_order' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            foreach ($validated['items'] as $item) {
                Experience::where('id', $item['id'])
                    ->update(['display_order' => $item['display_order']]);
            }

            DB::commit();

            // Clear relevant caches
            Cache::forget('experiences:published');

            return redirect()->back()->with('success', 'Experience order updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors([
                'reorder' => 'Failed to update order: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Show the form for creating a new experience
     */
    public function create()
    {
        return Inertia::render('Admin/Experience/Create');
    }

    /**
     * Store a newly created experience
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'employment_type' => 'required|in:full-time,part-time,contract,internship,freelance',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'location' => 'required|string|max:255',
            'is_remote' => 'boolean',
            'description' => 'required|string|max:500',
            'detailed_description' => 'nullable|string',
            'key_achievements' => 'nullable|array',
            'metrics' => 'nullable|array',
            'tech_stack' => 'nullable|array',
            'company_logo' => 'nullable|image|max:2048',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:5120',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'display_order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['company_name'].'-'.$validated['position']);

        if ($request->hasFile('company_logo')) {
            $validated['company_logo'] = $request->file('company_logo')
                ->store('experiences/logos', 'public');
        }

        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $image) {
                $galleryPaths[] = $image->store('experiences/gallery', 'public');
            }
            $validated['gallery'] = $galleryPaths;
        }

        Experience::create($validated);
        Cache::forget('experiences:published');

        return redirect()
            ->route('admin.experience.index')
            ->with('success', 'Experience created successfully!');
    }

    /**
     * Show the form for editing the specified experience
     */
    public function edit(Experience $experience)
    {
        return Inertia::render('Admin/Experience/Edit', [
            'experience' => [
                'id' => $experience->id,
                'slug' => $experience->slug,
                'company_name' => $experience->company_name,
                'company_logo' => $experience->company_logo,
                'position' => $experience->position,
                'employment_type' => $experience->employment_type,
                'start_date' => $experience->start_date->format('Y-m-d'),
                'end_date' => $experience->end_date?->format('Y-m-d'),
                'location' => $experience->location,
                'is_remote' => $experience->is_remote,
                'description' => $experience->description,
                'detailed_description' => $experience->detailed_description,
                'key_achievements' => $experience->key_achievements ?? [],
                'metrics' => $experience->metrics ?? [],
                'tech_stack' => $experience->tech_stack ?? [],
                'gallery' => $experience->gallery ?? [],
                'is_featured' => $experience->is_featured,
                'is_published' => $experience->is_published,
                'display_order' => $experience->display_order,
            ],
        ]);
    }

    /**
     * Update the specified experience
     */
    public function update(Request $request, Experience $experience)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'employment_type' => 'required|in:full-time,part-time,contract,internship,freelance',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'location' => 'required|string|max:255',
            'is_remote' => 'boolean',
            'description' => 'required|string|max:500',
            'detailed_description' => 'nullable|string',
            'key_achievements' => 'nullable|array',
            'metrics' => 'nullable|array',
            'tech_stack' => 'nullable|array',
            'company_logo' => 'nullable|image|max:2048',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:5120',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'display_order' => 'nullable|integer',
        ]);

        if (
            $validated['company_name'] !== $experience->company_name ||
            $validated['position'] !== $experience->position
        ) {
            $validated['slug'] = Str::slug($validated['company_name'].'-'.$validated['position']);
        }

        if ($request->hasFile('company_logo')) {
            if ($experience->company_logo) {
                Storage::disk('public')->delete($experience->company_logo);
            }
            $validated['company_logo'] = $request->file('company_logo')
                ->store('experiences/logos', 'public');
        }

        if ($request->hasFile('gallery')) {
            if ($experience->gallery) {
                foreach ($experience->gallery as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }

            $galleryPaths = [];
            foreach ($request->file('gallery') as $image) {
                $galleryPaths[] = $image->store('experiences/gallery', 'public');
            }
            $validated['gallery'] = $galleryPaths;
        }

        $experience->update($validated);

        Cache::forget('experiences:published');
        Cache::forget("experience:{$experience->slug}");
        Cache::forget("experience:{$experience->slug}:related");

        return redirect()
            ->route('admin.experience.index')
            ->with('success', 'Experience updated successfully!');
    }

    /**
     * Remove the specified experience
     */
    public function destroy(Experience $experience)
    {
        if ($experience->company_logo) {
            Storage::disk('public')->delete($experience->company_logo);
        }

        if ($experience->gallery) {
            foreach ($experience->gallery as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $experience->delete();

        Cache::forget('experiences:published');
        Cache::forget("experience:{$experience->slug}");

        return redirect()
            ->route('admin.experience.index')
            ->with('success', 'Experience deleted successfully!');
    }
}
