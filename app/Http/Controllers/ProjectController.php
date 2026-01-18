<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = Project::query()
            ->ordered() // ✅ Gunakan scope ordered
            ->paginate(10)
            ->through(fn($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'thumbnail_url' => $project->thumbnail_full_url,
                'status' => $project->status,
                'type' => $project->type,
                'display_order' => $project->display_order,
                'started_at' => $project->started_at?->format('Y-m-d'),
                'finished_at' => $project->finished_at?->format('Y-m-d'),
            ]);

        // ✅ Get unique types for filter
        $availableTypes = Project::getAvailableTypes();

        return Inertia::render('Admin/Project/Index', [
            'projects' => $projects,
            'availableTypes' => $availableTypes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Project/ProjectForm', [
            'typeForm' => 'create',
            'project' => null,
            'availableTypes' => Project::getAvailableTypes(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:projects,slug',
            'excerpt' => 'required|string|max:500',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'technologies' => 'nullable|string',
            'demo_url' => 'nullable|url|max:255',
            'repo_url' => 'nullable|url|max:255',
            'started_at' => 'nullable|date',
            'finished_at' => 'nullable|date|after_or_equal:started_at',
            'status' => 'required|in:ongoing,completed,upcoming,paused',
            'type' => 'nullable|string|max:100',
        ]);

        // Parse technologies
        $technologies = [];
        if (!empty($validated['technologies'])) {
            $technologies = json_decode($validated['technologies'], true) ?? [];
        }

        // Upload thumbnail to Cloudinary
        $thumbnailUrl = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailUrl = $this->uploadToCloudinary($request->file('thumbnail'), 'projects');
        }

        Project::create([
            'title' => $validated['title'],
            'slug' => $validated['slug'] ?? Str::slug($validated['title']),
            'excerpt' => $validated['excerpt'],
            'thumbnail_url' => $thumbnailUrl,
            'technologies' => $technologies,
            'demo_url' => $validated['demo_url'] ?? null,
            'repo_url' => $validated['repo_url'] ?? null,
            'started_at' => $validated['started_at'] ?? null,
            'finished_at' => $validated['finished_at'] ?? null,
            'status' => $validated['status'],
            'type' => $validated['type'] ?? null,
        ]);

        return redirect()->route('admin.project.index')
            ->with('success', 'Project created successfully!');
    }

    public function edit(Project $project)
    {
        return Inertia::render('Admin/Project/ProjectForm', [
            'typeForm' => 'edit',
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'excerpt' => $project->excerpt,
                'thumbnail_url' => $project->thumbnail_full_url,
                'technologies' => $project->technologies,
                'demo_url' => $project->demo_url,
                'repo_url' => $project->repo_url,
                'started_at' => $project->started_at?->format('Y-m-d'),
                'finished_at' => $project->finished_at?->format('Y-m-d'),
                'status' => $project->status,
                'type' => $project->type,
                'display_order' => $project->display_order,
            ],
            'availableTypes' => Project::getAvailableTypes(),
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:projects,slug,' . $project->id,
            'excerpt' => 'required|string|max:500',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'technologies' => 'nullable|string',
            'demo_url' => 'nullable|url|max:255',
            'repo_url' => 'nullable|url|max:255',
            'started_at' => 'nullable|date',
            'finished_at' => 'nullable|date|after_or_equal:started_at',
            'status' => 'required|in:ongoing,completed,upcoming,paused',
            'type' => 'nullable|string|max:100',
        ]);

        $technologies = [];
        if (!empty($validated['technologies'])) {
            $technologies = json_decode($validated['technologies'], true) ?? [];
        }

        // Handle thumbnail update
        $thumbnailUrl = $project->thumbnail_url;
        if ($request->hasFile('thumbnail')) {
            // Delete old image from Cloudinary
            if ($project->thumbnail_url && str_contains($project->thumbnail_url, 'cloudinary.com')) {
                $this->deleteFromCloudinary($project->thumbnail_url, 'projects');
            }
            $thumbnailUrl = $this->uploadToCloudinary($request->file('thumbnail'), 'projects');
        }

        $project->update([
            'title' => $validated['title'],
            'excerpt' => $validated['excerpt'],
            'thumbnail_url' => $thumbnailUrl,
            'technologies' => $technologies,
            'demo_url' => $validated['demo_url'] ?? null,
            'repo_url' => $validated['repo_url'] ?? null,
            'started_at' => $validated['started_at'] ?? null,
            'finished_at' => $validated['finished_at'] ?? null,
            'status' => $validated['status'],
            'type' => $validated['type'] ?? null,
        ]);

        return redirect()->route('admin.project.index')
            ->with('success', 'Project updated successfully!');
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return redirect()->route('admin.project.index')
            ->with('success', 'Project deleted successfully!');
    }

    // ✅ NEW: Reorder Projects
    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:projects,id',
            'items.*.display_order' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            Project::where('id', $item['id'])->update([
                'display_order' => $item['display_order']
            ]);
        }

        return back()->with('success', 'Order updated successfully!');
    }

    // ==================== CLOUDINARY HELPERS ====================
    private function uploadToCloudinary($file, string $folder): ?string
    {
        try {
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key' => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ]
            ]);

            $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
                'resource_type' => 'image',
            ]);

            return $result['secure_url'];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            return null;
        }
    }

    private function deleteFromCloudinary(string $url, string $folder): void
    {
        try {
            $path = parse_url($url, PHP_URL_PATH);
            if ($path && str_contains($path, $folder . '/')) {
                preg_match("/({$folder}\/[^\.]+)/", $path, $matches);
                if (isset($matches[1])) {
                    $cloudinary = new Cloudinary([
                        'cloud' => [
                            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                            'api_key' => env('CLOUDINARY_API_KEY'),
                            'api_secret' => env('CLOUDINARY_API_SECRET'),
                        ]
                    ]);
                    $cloudinary->uploadApi()->destroy($matches[1]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Cloudinary delete failed: ' . $e->getMessage());
        }
    }
}