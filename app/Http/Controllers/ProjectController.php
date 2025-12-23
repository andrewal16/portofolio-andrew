<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Cloudinary\Cloudinary as CloudinarySDK;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Folder di Cloudinary untuk menyimpan project thumbnails
     */
    private const CLOUDINARY_FOLDER = 'projects';

    /**
     * Display a listing of projects.
     */
    public function index()
    {
        $projects = Project::latest()
            ->paginate(10)
            ->through(fn ($project) => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'excerpt' => $project->excerpt,
                'thumbnail_url' => $project->thumbnail_full_url,
                'demo_url' => $project->demo_url,
                'repo_url' => $project->repo_url,
                'started_at' => $project->started_at?->format('Y-m-d'),
                'finished_at' => $project->finished_at?->format('Y-m-d'),
                'status' => $project->status,
                'type' => $project->type,
                'technologies' => $project->technologies,
                'created_at' => $project->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $project->updated_at?->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('Admin/Project/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Show the form for creating a new project.
     */
    public function create()
    {
        return Inertia::render('Admin/Project/ProjectForm', [
            'typeForm' => 'create',
            'project' => null,
        ]);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();

        try {
            // 1. Upload Thumbnail ke Cloudinary
            if ($request->hasFile('thumbnail')) {
                $data['thumbnail_url'] = $this->uploadToCloudinary(
                    $request->file('thumbnail'),
                    $request->slug ?: str()->slug($request->title)
                );
            }

            // Hapus raw file dari data
            unset($data['thumbnail']);

            // 2. Decode JSON String technologies dari React
            if ($request->has('technologies')) {
                $data['technologies'] = json_decode($request->technologies, true) ?? [];
            }

            // 3. Create project
            Project::create($data);

            return redirect()
                ->route('admin.project.index')
                ->with('success', 'Project berhasil dibuat!');

        } catch (\Exception $e) {
            Log::error('Error creating project', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Gagal membuat project: '.$e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified project.
     */
    public function edit(Project $project)
    {
        return Inertia::render('Admin/Project/ProjectForm', [
            'typeForm' => 'edit',
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'excerpt' => $project->excerpt,
                'technologies' => $project->technologies, // Array otomatis dari cast
                'thumbnail_url' => $project->thumbnail_full_url, // Full Cloudinary URL
                'demo_url' => $project->demo_url,
                'repo_url' => $project->repo_url,
                'started_at' => $project->started_at?->format('Y-m-d'),
                'finished_at' => $project->finished_at?->format('Y-m-d'),
                'status' => $project->status,
                'type' => $project->type,
            ],
        ]);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();

        try {
            // 1. Handle Thumbnail dengan robust error handling
            if ($request->hasFile('thumbnail')) {
                // Hapus file lama HANYA jika URL-nya valid Cloudinary
                if ($project->thumbnail_url && str_contains($project->thumbnail_url, 'cloudinary.com')) {
                    $this->deleteFromCloudinary($project->thumbnail_url);
                }

                // Upload thumbnail baru
                $data['thumbnail_url'] = $this->uploadToCloudinary(
                    $request->file('thumbnail'),
                    $request->slug ?: $project->slug
                );
            }

            unset($data['thumbnail']);

            // 2. Decode technologies dari React
            if ($request->has('technologies')) {
                $data['technologies'] = json_decode($request->technologies, true) ?? [];
            }

            // 3. Update project
            $project->update($data);

            return redirect()
                ->route('admin.project.edit', $project)
                ->with('success', 'Project berhasil diupdate!');

        } catch (\Exception $e) {
            Log::error('Error updating project', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Gagal update project: '.$e->getMessage()]);
        }
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(Project $project)
    {
        try {
            // Hapus thumbnail dari Cloudinary
            if ($project->thumbnail_url && str_contains($project->thumbnail_url, 'cloudinary.com')) {
                $this->deleteFromCloudinary($project->thumbnail_url);
            }

            // Delete project
            $project->delete();

            return redirect()
                ->route('admin.project.index')
                ->with('success', 'Project berhasil dihapus!');

        } catch (\Exception $e) {
            Log::error('Error deleting project', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withErrors(['error' => 'Gagal menghapus project: '.$e->getMessage()]);
        }
    }

    // ==================== CLOUDINARY HELPER METHODS ====================

    /**
     * Upload image ke Cloudinary dengan error handling robust
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     * @return string Secure URL dari Cloudinary
     *
     * @throws \Exception
     */
    private function uploadToCloudinary($file, string $slug): string
    {
        // Validasi file object
        if (! $file || ! $file->isValid()) {
            throw new \Exception('Invalid file upload');
        }

        $fileName = sprintf('%s-%s', str()->slug($slug), time());

        try {
            // Cek apakah credentials tersedia
            $cloudName = env('CLOUDINARY_CLOUD_NAME');
            $apiKey = env('CLOUDINARY_API_KEY');
            $apiSecret = env('CLOUDINARY_API_SECRET');

            if (! $cloudName || ! $apiKey || ! $apiSecret) {
                throw new \Exception('Cloudinary credentials not configured properly');
            }

            // Initialize Cloudinary SDK
            $cloudinary = new CloudinarySDK([
                'cloud' => [
                    'cloud_name' => $cloudName,
                    'api_key' => $apiKey,
                    'api_secret' => $apiSecret,
                ],
                'url' => ['secure' => true],
            ]);

            // Get file path dengan fallback
            $filePath = $file->getRealPath() ?: $file->getPathname();

            if (! $filePath || ! file_exists($filePath)) {
                throw new \Exception('File path not accessible');
            }

            // Log upload attempt
            Log::info('Uploading project thumbnail to Cloudinary', [
                'file_name' => $fileName,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'file_path' => $filePath,
            ]);

            // Upload ke Cloudinary dengan optimization
            $result = $cloudinary->uploadApi()->upload($filePath, [
                'folder' => self::CLOUDINARY_FOLDER,
                'public_id' => $fileName,
                'resource_type' => 'image',
                'transformation' => [
                    'width' => 1200,
                    'height' => 630,
                    'crop' => 'limit',
                    'quality' => 'auto',
                    'fetch_format' => 'auto',
                ],
            ]);

            // Log success
            Log::info('Cloudinary upload successful', [
                'url' => $result['secure_url'],
                'public_id' => $result['public_id'],
            ]);

            return $result['secure_url'];

        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed', [
                'file_name' => $fileName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Failed to upload thumbnail to Cloudinary: '.$e->getMessage());
        }
    }

    /**
     * Hapus image dari Cloudinary
     */
    private function deleteFromCloudinary(?string $fullUrl): bool
    {
        // Early return jika URL kosong
        if (! $fullUrl) {
            Log::info('Delete skipped: Empty URL');

            return false;
        }

        // Early return jika bukan Cloudinary URL
        if (! str_contains($fullUrl, 'cloudinary.com')) {
            Log::info('Delete skipped: Not a Cloudinary URL', ['url' => $fullUrl]);

            return false;
        }

        try {
            // Extract public ID dari URL
            $publicId = $this->getPublicIdFromUrl($fullUrl);

            if (! $publicId) {
                Log::warning('Failed to extract public ID from URL', ['url' => $fullUrl]);

                return false;
            }

            // Cek credentials
            $cloudName = env('CLOUDINARY_CLOUD_NAME');
            $apiKey = env('CLOUDINARY_API_KEY');
            $apiSecret = env('CLOUDINARY_API_SECRET');

            if (! $cloudName || ! $apiKey || ! $apiSecret) {
                Log::error('Cloudinary credentials not configured for delete operation');

                return false;
            }

            // Initialize Cloudinary SDK
            $cloudinary = new CloudinarySDK([
                'cloud' => [
                    'cloud_name' => $cloudName,
                    'api_key' => $apiKey,
                    'api_secret' => $apiSecret,
                ],
            ]);

            Log::info('Deleting from Cloudinary', ['public_id' => $publicId]);

            // Delete dari Cloudinary
            $result = $cloudinary->uploadApi()->destroy($publicId);

            Log::info('Cloudinary delete result', [
                'public_id' => $publicId,
                'result' => $result,
            ]);

            return true;

        } catch (\Exception $e) {
            // PENTING: Log error tapi JANGAN throw exception
            // Delete gagal tidak boleh block proses update
            Log::error('Cloudinary delete failed', [
                'url' => $fullUrl,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Extract Public ID dari Cloudinary URL
     */
    private function getPublicIdFromUrl(string $url): ?string
    {
        try {
            // Cek apakah URL mengandung cloudinary.com
            if (! str_contains($url, 'cloudinary.com')) {
                return null;
            }

            // Parse URL path
            $path = parse_url($url, PHP_URL_PATH);

            if (! $path) {
                Log::warning('Failed to parse URL path', ['url' => $url]);

                return null;
            }

            // Cari posisi folder
            $folderPos = strpos($path, self::CLOUDINARY_FOLDER);

            if ($folderPos === false) {
                Log::warning('Folder not found in URL path', [
                    'path' => $path,
                    'folder' => self::CLOUDINARY_FOLDER,
                ]);

                return null;
            }

            // Extract relative path mulai dari folder
            $relativePath = substr($path, $folderPos);

            // Remove extension dan construct public ID
            $dirname = pathinfo($relativePath, PATHINFO_DIRNAME);
            $filename = pathinfo($relativePath, PATHINFO_FILENAME);

            $publicId = $dirname.'/'.$filename;

            Log::info('Extracted public ID from URL', [
                'url' => $url,
                'public_id' => $publicId,
            ]);

            return $publicId;

        } catch (\Exception $e) {
            Log::error('Error extracting public ID from URL', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
