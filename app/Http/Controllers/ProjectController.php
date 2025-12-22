<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::latest()
            ->paginate(10)
            ->through(fn($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'excerpt' => $project->excerpt,
                'thumbnail_url' => $project->thumbnail_full_url, // ✅ Gunakan accessor
                'demo_url' => $project->demo_url,
                'repo_url' => $project->repo_url,
                'started_at' => $project->started_at?->format('Y-m-d'),
                'finished_at' => $project->finished_at?->format('Y-m-d'),
                'status' => $project->status,
                'type' => $project->type,
                'created_at' => $project->created_at?->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('Admin/Project/Index', [
            'projects' => $projects,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Project/ProjectForm', [
            'typeForm' => 'create',
            'project' => null,
        ]);
    }

    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();

        // 1. Handle Thumbnail
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $filename = $request->slug ?: str()->slug($request->title);
            $path = $file->storeAs(
                'projects',
                $filename . '-' . time() . '.' . $file->extension(),
                'public'
            );
            $data['thumbnail_url'] = $path;
        }
        // Hapus raw file agar tidak error SQL
        unset($data['thumbnail']);

        // ✅ 2. FIX UTAMA: Decode JSON String menjadi Array PHP
        // React mengirim: "['React', 'Laravel']" (String)
        // Kita ubah jadi: ['React', 'Laravel'] (Array)
        if ($request->technologies) {
            $data['technologies'] = json_decode($request->technologies, true);
        }

        Project::create($data);

        return redirect()
            ->route('admin.project.index')
            ->with('success', 'Project berhasil dibuat!');
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
                'technologies' => $project->technologies,
                'thumbnail_url' => $project->thumbnail_full_url, // ✅ Full URL
                'demo_url' => $project->demo_url,
                'repo_url' => $project->repo_url,
                'started_at' => $project->started_at?->format('Y-m-d'),
                'finished_at' => $project->finished_at?->format('Y-m-d'),
                'status' => $project->status,
                'type' => $project->type,
            ],
        ]);
    }


    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();

        // 1. Handle Thumbnail
        if ($request->hasFile('thumbnail')) {
            if ($project->thumbnail_url && !filter_var($project->thumbnail_url, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($project->thumbnail_url);
            }
            $file = $request->file('thumbnail');
            $filename = $request->slug ?: $project->slug;
            $path = $file->storeAs(
                'projects',
                $filename . '-' . time() . '.' . $file->extension(),
                'public'
            );
            $data['thumbnail_url'] = $path;
        }
        unset($data['thumbnail']);

        if ($request->technologies) {
            $data['technologies'] = json_decode($request->technologies, true);
        }

        $project->update($data);

        return redirect()
            ->route('admin.project.edit', $project)
            ->with('success', 'Project berhasil diupdate!');
    }

    public function destroy(Project $project)
    {
        // File akan otomatis terhapus karena event di Model
        $project->delete();

        return redirect()
            ->route('admin.project.index')
            ->with('success', 'Project berhasil dihapus!');
    }
}
