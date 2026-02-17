<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
// ✅ Import Trait yang baru dibuat
use App\Traits\HasCloudinaryUpload;

class ExperienceController extends Controller
{
    // ✅ Gunakan Trait di sini
    use HasCloudinaryUpload;

    public function index()
    {
        // ... (Code index kamu sudah oke, tidak perlu diubah) ...
        $experiences = Experience::orderBy('display_order', 'asc')
            ->orderBy('start_date', 'desc')
            ->paginate(50)
            ->through(function ($exp) {
                return [
                    'id' => $exp->id,
                    'slug' => $exp->slug,
                    'company_name' => $exp->company_name,
                    'company_logo' => $exp->company_logo, // Ini nanti isinya URL Cloudinary
                    'position' => $exp->position,
                    'employment_type' => $exp->employment_type,
                    'employment_type_label' => $exp->getEmploymentTypeLabel(), // Pastikan method ini ada di Model
                    'formatted_duration' => $exp->formatted_duration, // Pastikan accessor ini ada di Model
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

    public function reorder(Request $request)
    {
        // ... (Code reorder kamu sudah oke) ...
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
            Cache::forget('experiences:published');
            return redirect()->back()->with('success', 'Experience order updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['reorder' => 'Failed: '.$e->getMessage()]);
        }
    }

    public function create()
    {
        return Inertia::render('Admin/Experience/Create');
    }

    public function store(Request $request)
    {
        // ... (Validasi kamu sudah oke) ...
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

        // ✅ PERBAIKAN: Upload Logo ke Cloudinary
        if ($request->hasFile('company_logo')) {
            $validated['company_logo'] = $this->uploadToCloudinary(
                $request->file('company_logo'), 
                'experiences/logos' // Folder di Cloudinary
            );
        }

        // ✅ PERBAIKAN: Upload Gallery ke Cloudinary
        if ($request->hasFile('gallery')) {
            $galleryUrls = [];
            foreach ($request->file('gallery') as $image) {
                $url = $this->uploadToCloudinary($image, 'experiences/gallery');
                if ($url) $galleryUrls[] = $url;
            }
            $validated['gallery'] = $galleryUrls; // Laravel otomatis cast ke JSON jika di model di-cast
        }

        Experience::create($validated);
        Cache::forget('experiences:published');

        return redirect()->route('admin.experience.index')->with('success', 'Experience created successfully!');
    }

    public function edit(Experience $experience)
    {
        // ... (Code edit kamu sudah oke) ...
        return Inertia::render('Admin/Experience/Edit', [
            'experience' => [
                'id' => $experience->id,
                'slug' => $experience->slug,
                'company_name' => $experience->company_name,
                'company_logo' => $experience->company_logo, // URL Cloudinary
                'position' => $experience->position,
                'employment_type' => $experience->employment_type,
                'start_date' => $experience->start_date->format('Y-m-d'),
                'end_date' => $experience->end_date?->format('Y-m-d'),
                'location' => $experience->location,
                'is_remote' => (bool)$experience->is_remote,
                'description' => $experience->description,
                'detailed_description' => $experience->detailed_description,
                'key_achievements' => $experience->key_achievements ?? [],
                'metrics' => $experience->metrics ?? [],
                'tech_stack' => $experience->tech_stack ?? [],
                'gallery' => $experience->gallery ?? [], // Array URL
                'is_featured' => (bool)$experience->is_featured,
                'is_published' => (bool)$experience->is_published,
                'display_order' => $experience->display_order,
            ],
        ]);
    }

    public function update(Request $request, Experience $experience)
    {
        // ... (Validasi sama seperti store) ...
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

        if ($validated['company_name'] !== $experience->company_name || $validated['position'] !== $experience->position) {
            $validated['slug'] = Str::slug($validated['company_name'].'-'.$validated['position']);
        }

        // ✅ PERBAIKAN: Update Logo
        if ($request->hasFile('company_logo')) {
            // 1. Hapus logo lama di Cloudinary
            if ($experience->company_logo) {
                $this->deleteFromCloudinary($experience->company_logo, 'experiences/logos');
            }
            // 2. Upload logo baru
            $validated['company_logo'] = $this->uploadToCloudinary(
                $request->file('company_logo'), 
                'experiences/logos'
            );
        }

        // ✅ PERBAIKAN: Update Gallery
        // Catatan: Logic ini me-REPLACE seluruh galeri jika ada upload baru.
        if ($request->hasFile('gallery')) {
            // 1. Hapus semua foto lama di galeri Cloudinary
            if (!empty($experience->gallery)) {
                foreach ($experience->gallery as $oldImageUrl) {
                    $this->deleteFromCloudinary($oldImageUrl, 'experiences/gallery');
                }
            }

            // 2. Upload foto-foto baru
            $galleryUrls = [];
            foreach ($request->file('gallery') as $image) {
                $url = $this->uploadToCloudinary($image, 'experiences/gallery');
                if ($url) $galleryUrls[] = $url;
            }
            $validated['gallery'] = $galleryUrls;
        }

        $experience->update($validated);

        Cache::forget('experiences:published');
        Cache::forget("experience:{$experience->slug}");
        Cache::forget("experience:{$experience->slug}:related");

        return redirect()->route('admin.experience.index')->with('success', 'Experience updated successfully!');
    }

    public function destroy(Experience $experience)
    {
        // ✅ PERBAIKAN: Hapus Logo
        if ($experience->company_logo) {
            $this->deleteFromCloudinary($experience->company_logo, 'experiences/logos');
        }

        // ✅ PERBAIKAN: Hapus Gallery
        if (!empty($experience->gallery)) {
            foreach ($experience->gallery as $imageUrl) {
                $this->deleteFromCloudinary($imageUrl, 'experiences/gallery');
            }
        }

        $experience->delete();
        Cache::forget('experiences:published');
        Cache::forget("experience:{$experience->slug}");

        return redirect()->route('admin.experience.index')->with('success', 'Experience deleted successfully!');
    }
}