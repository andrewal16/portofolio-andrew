<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Traits\HasCloudinaryUpload;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProjectController extends Controller
{
    use HasCloudinaryUpload; // ✅ Panggil Trait

    public function index(Request $request)
    {
        $projects = Project::query()
            ->ordered()
            ->paginate(10)
            ->through(fn($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'thumbnail_url' => $project->thumbnail_url, // Full URL Cloudinary
                'status' => $project->status,
                'type' => $project->type,
                'display_order' => $project->display_order,
            ]);

        return Inertia::render('Admin/Project/Index', [
            'projects' => $projects,
            'availableTypes' => Project::getAvailableTypes(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'status' => 'required|in:ongoing,completed,upcoming,paused',
            'type' => 'nullable|string|max:100',
            'technologies' => 'nullable|string', // JSON string dari frontend
        ]);

        $thumbnailUrl = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailUrl = $this->uploadToCloudinary($request->file('thumbnail'), 'projects');
        }

        Project::create([
            ...$validated,
            'slug' => $request->slug ?? Str::slug($request->title),
            'thumbnail_url' => $thumbnailUrl,
            'technologies' => json_decode($request->technologies, true) ?? [],
        ]);

        return redirect()->route('admin.project.index')->with('success', 'Project created successfully!');
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'status' => 'required|in:ongoing,completed,upcoming,paused',
        ]);

        $thumbnailUrl = $project->thumbnail_url;
        if ($request->hasFile('thumbnail')) {
            // Hapus yang lama, upload yang baru
            $this->deleteFromCloudinary($project->thumbnail_url, 'projects');
            $thumbnailUrl = $this->uploadToCloudinary($request->file('thumbnail'), 'projects');
        }

        $project->update([
            ...$request->except('thumbnail'),
            'thumbnail_url' => $thumbnailUrl,
            'technologies' => json_decode($request->technologies, true) ?? [],
        ]);

        return redirect()->route('admin.project.index')->with('success', 'Project updated successfully!');
    }

    public function destroy(Project $project)
    {
        // Hapus aset di cloud sebelum hapus di DB
        $this->deleteFromCloudinary($project->thumbnail_url, 'projects');
        $project->delete();
        return back()->with('success', 'Project deleted successfully!');
    }
}