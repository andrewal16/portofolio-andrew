<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCertificateRequest;
use App\Http\Requests\UpdateCertificateRequest;
use App\Models\Certificate;
use App\Models\Tag;
use Cloudinary\Cloudinary as CloudinarySDK;
// use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
// use Cloudinary\Cloudinary as CloudinarySDK;
use Illuminate\Support\Facades\Log;
// Import Cloudinary Facade
use Inertia\Inertia;

class CertificateController extends Controller
{
    // Folder di dalam Cloudinary
    private const CLOUDINARY_FOLDER = 'certificates';

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
                'url' => ['secure' => true],
            ]);

            $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                'folder' => self::CLOUDINARY_FOLDER,
                'public_id' => $fileName,
                'resource_type' => 'auto',
            ]);

            return $result['secure_url'];

        } catch (\Exception $e) {
            Log::error('Cloudinary upload error (Certificate)', [
                'message' => $e->getMessage(),
                'file' => $fileName,
            ]);

            throw new \Exception('Failed to upload to Cloudinary: '.$e->getMessage());
        }
    }

    public function index()
    {
        $certificates = Certificate::with('tags')
            ->latestIssued()
            ->paginate(10)
            ->through(fn ($cert) => [
                'id' => $cert->id,
                'name' => $cert->name,
                'issuer' => $cert->issuer,
                'issued_at' => $cert->issued_at->format('Y-m-d'),
                'issued_year' => $cert->issued_year,
                'credential_id' => $cert->credential_id,
                'credential_url' => $cert->credential_url,
                // Karena di DB sekarang tersimpan URL full, panggil langsung
                'image_url' => $cert->image_url,

                // Logic file type tetap sama
                'file_type' => $this->getFileType($cert->image_url),

                'tags' => $cert->tags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                ]),
                'created_at' => $cert->created_at->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('Admin/Certificate/Index', [
            'certificates' => $certificates,
        ]);
    }

    /**
     * Show the form for creating a new certificate.
     */
    public function create()
    {
        $tags = Tag::orderBy('name')->get()->map(fn ($tag) => [
            'value' => $tag->id,
            'label' => $tag->name,
            'color' => $tag->color,
        ]);

        return Inertia::render('Admin/Certificate/CertificateForm', [
            'typeForm' => 'create',
            'certificate' => null,
            'availableTags' => $tags,
        ]);
    }

    /**
     * Store a newly created certificate in storage.
     */
    public function store(StoreCertificateRequest $request)
    {
        $data = $request->validated();

        // Upload image/PDF ke Cloudinary
        if ($request->hasFile('image')) {
            $data['image_url'] = $this->uploadToCloudinary(
                $request->file('image'),
                str()->slug($request->name)
            );
        }

        // Simpan tags sementara
        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        // Create certificate
        $certificate = Certificate::create($data);

        // Attach tags
        if (! empty($tags)) {
            $certificate->tags()->attach($tags);
        }

        return redirect()
            ->route('admin.certificate.edit', $certificate->id)
            ->with('success', 'Sertifikat berhasil ditambahkan!');
    }

    /**
     * Show the form for editing the specified certificate.
     */
    public function edit(Certificate $certificate)
    {
        $certificate->load('tags');

        $tags = Tag::orderBy('name')->get()->map(fn ($tag) => [
            'value' => $tag->id,
            'label' => $tag->name,
            'color' => $tag->color,
        ]);

        return Inertia::render('Admin/Certificate/CertificateForm', [
            'typeForm' => 'edit',
            'certificate' => [
                'id' => $certificate->id,
                'name' => $certificate->name,
                'issuer' => $certificate->issuer,
                'issued_at' => $certificate->issued_at->format('Y-m-d'),
                'credential_id' => $certificate->credential_id,
                'credential_url' => $certificate->credential_url,
                'image_url' => $certificate->image_url, // URL Cloudinary

                'file_type' => $this->getFileType($certificate->image_url),

                'tags' => $certificate->tags->pluck('id')->toArray(),
            ],
            'availableTags' => $tags,
        ]);
    }

    /**
     * Update the specified certificate in storage.
     */
    public function update(UpdateCertificateRequest $request, Certificate $certificate)
    {
        $data = $request->validated();

        // Upload image/PDF baru kalau ada
        if ($request->hasFile('image')) {
            // 1. Hapus file lama di Cloudinary
            $this->deleteFromCloudinary($certificate->image_url);

            // 2. Upload file baru
            $data['image_url'] = $this->uploadToCloudinary(
                $request->file('image'),
                str()->slug($request->name)
            );
        }

        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        $certificate->update($data);
        $certificate->tags()->sync($tags);

        return redirect()
            ->route('admin.certificate.edit', $certificate->id)
            ->with('success', 'Sertifikat berhasil diupdate!');
    }

    /**
     * Remove the specified certificate from storage.
     */
    public function destroy(Certificate $certificate)
    {
        // Hapus file di Cloudinary
        $this->deleteFromCloudinary($certificate->image_url);

        $certificate->delete();

        return redirect()
            ->route('admin.certificate.index')
            ->with('success', 'Sertifikat berhasil dihapus!');
    }

    private function deleteFromCloudinary(?string $fullUrl): bool
    {
        if (! $fullUrl || ! str_contains($fullUrl, 'cloudinary.com')) {
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
            Log::error('Cloudinary delete error (Certificate): '.$e->getMessage());
        }

        return false;
    }

    private function getPublicIdFromUrl(string $url): ?string
    {
        // Cek apakah ini URL cloudinary
        if (! str_contains($url, 'cloudinary.com')) {
            return null;
        }

        // ✅ FIX: Add null check
        $path = parse_url($url, PHP_URL_PATH);

        if (! $path) {
            Log::warning("Failed to parse Cloudinary URL: {$url}");

            return null;
        }

        // Cari posisi folder project kita
        $folderPos = strpos($path, self::CLOUDINARY_FOLDER);

        if ($folderPos === false) {
            return null;
        }

        // Ambil string mulai dari folder name
        $relativePath = substr($path, $folderPos);

        // Hilangkan extension
        return pathinfo($relativePath, PATHINFO_DIRNAME).'/'.pathinfo($relativePath, PATHINFO_FILENAME);
    }

    /**
     * Get file type (pdf atau image) dari file path.
     */
    private function getFileType(?string $filePath): string
    {
        if (! $filePath) {
            return 'image';
        }

        // ✅ FIX: Add null check untuk parse_url
        $parsedPath = parse_url($filePath, PHP_URL_PATH);

        if (! $parsedPath) {
            return 'image'; // Default ke image jika URL invalid
        }

        $extension = strtolower(pathinfo($parsedPath, PATHINFO_EXTENSION));

        return $extension === 'pdf' ? 'pdf' : 'image';
    }
}
