<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Cloudinary\Cloudinary as CloudinarySDK; // ✅ Import SDK
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProjectController extends Controller
{
    // ✅ Folder di Cloudinary
    private const CLOUDINARY_FOLDER = 'projects';

    public function index()
    {
        $projects = Project::latest()
            ->paginate(10)
            ->through(fn ($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'excerpt' => $project->excerpt,
                'thumbnail_url' => $project->thumbnail_full_url, // ✅ Accessor sudah handle Cloudinary
                'demo_url' => $project->demo_url,
                'repo_url' => $project->repo_url,
                'started_at' => $project->started_at?->format('Y-m-d'),
                'finished_at' => $project->finished_at?->format('Y-m-d'),
                'status' => $project->status,
                'type' => $project->type,
                'technologies' => $project->technologies, // ✅ Array langsung
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

        // ✅ 1. Upload Thumbnail ke Cloudinary
        if ($request->hasFile('thumbnail')) {
            $data['thumbnail_url'] = $this->uploadToCloudinary(
                $request->file('thumbnail'),
                $request->slug ?: str()->slug($request->title)
            );
        }

        unset($data['thumbnail']); // Hapus raw file

        // ✅ 2. Decode JSON String dari React
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
                'technologies' => $project->technologies, // ✅ Array langsung (cast otomatis)
                'thumbnail_url' => $project->thumbnail_full_url, // ✅ Full Cloudinary URL
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

        // ✅ 1. Handle Thumbnail dengan Cloudinary
        if ($request->hasFile('thumbnail')) {
            // Hapus thumbnail lama di Cloudinary
            $this->deleteFromCloudinary($project->thumbnail_url);

            // Upload thumbnail baru
            $data['thumbnail_url'] = $this->uploadToCloudinary(
                $request->file('thumbnail'),
                $request->slug ?: $project->slug
            );
        }

        unset($data['thumbnail']);

        // ✅ 2. Decode technologies dari React
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
        // ✅ Hapus thumbnail dari Cloudinary
        $this->deleteFromCloudinary($project->thumbnail_url);

        // Delete project (Model event juga akan cleanup)
        $project->delete();

        return redirect()
            ->route('admin.project.index')
            ->with('success', 'Project berhasil dihapus!');
    }

    // ==================== CLOUDINARY HELPERS ====================

    /**
     * ✅ Upload image ke Cloudinary
     */
    private function uploadToCloudinary($file, string $slug): string
    {
        $fileName = sprintf('%s-%s', $slug, time());

        try {
            $cloudinary = new CloudinarySDK([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key' => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ],
                'url' => [
                    'secure' => true,
                ],
            ]);

            $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                'folder' => self::CLOUDINARY_FOLDER,
                'public_id' => $fileName,
                'resource_type' => 'image', // Project hanya butuh image
                'transformation' => [ // ✅ Optional: Auto-optimize untuk web
                    'width' => 1200,
                    'height' => 630,
                    'crop' => 'limit',
                    'quality' => 'auto',
                    'fetch_format' => 'auto',
                ],
            ]);

            return $result['secure_url'];

        } catch (\Exception $e) {
            Log::error('Cloudinary upload error (Project)', [
                'message' => $e->getMessage(),
                'file' => $fileName,
            ]);

            throw new \Exception('Failed to upload thumbnail to Cloudinary: '.$e->getMessage());
        }
    }

    /**
     * ✅ Hapus image dari Cloudinary
     */
    private function deleteFromCloudinary(?string $fullUrl): bool
    {
        if (! $fullUrl) {
            return false;
        }

        try {
            $publicId = $this->getPublicIdFromUrl($fullUrl);

            if ($publicId) {
                $cloudinary = new CloudinarySDK([
                    'cloud' => [
                        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                        'api_key' => env('CLOUDINARY_API_KEY'),
                        'api_secret' => env('CLOUDINARY_API_SECRET'),
                    ],
                ]);

                $cloudinary->uploadApi()->destroy($publicId);

                return true;
            }
        } catch (\Exception $e) {
            Log::error('Cloudinary delete error (Project): '.$e->getMessage());
        }

        return false;
    }

    /**
     * ✅ Extract Public ID dari Cloudinary URL
     */
    private function getPublicIdFromUrl(string $url): ?string
    {
        if (! str_contains($url, 'cloudinary.com')) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH);

        if (! $path) {
            return null;
        }

        $folderPos = strpos($path, self::CLOUDINARY_FOLDER);

        if ($folderPos === false) {
            return null;
        }

        $relativePath = substr($path, $folderPos);

        return pathinfo($relativePath, PATHINFO_DIRNAME).'/'.pathinfo($relativePath, PATHINFO_FILENAME);
    }
}
