<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCertificateRequest;
use App\Http\Requests\UpdateCertificateRequest;
use App\Models\Certificate;
use App\Models\Tag;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateController extends Controller
{
    private const STORAGE_DISK = 'public';
    private const IMAGE_PATH = 'certificates/images';

    /**
     * Display a listing of certificates.
     */
    public function index()
    {
        $certificates = Certificate::with('tags')
            ->latestIssued()
            ->paginate(10)
            ->through(fn($cert) => [
                'id' => $cert->id,
                'name' => $cert->name,
                'issuer' => $cert->issuer,
                'issued_at' => $cert->issued_at->format('Y-m-d'),
                'issued_year' => $cert->issued_year,
                'credential_id' => $cert->credential_id,
                'credential_url' => $cert->credential_url,
                'image_url' => $cert->image_full_url,

                // 🔥 PENTING: Kirim file_type untuk frontend
                'file_type' => $this->getFileType($cert->image_url),

                'tags' => $cert->tags->map(fn($tag) => [
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
        $tags = Tag::orderBy('name')->get()->map(fn($tag) => [
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

        // Upload image/PDF kalau ada
        if ($request->hasFile('image')) {
            $data['image_url'] = $this->uploadImage(
                $request->file('image'),
                str()->slug($request->name)
            );
        }

        // Simpan tags sementara, lalu hapus dari $data
        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        // Create certificate
        $certificate = Certificate::create($data);

        // Attach tags ke certificate
        if (!empty($tags)) {
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

        $tags = Tag::orderBy('name')->get()->map(fn($tag) => [
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
                'image_url' => $certificate->image_full_url,

                // 🔥 Kirim file_type untuk form edit
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
            // Hapus file lama
            $this->deleteImage($certificate->image_url);

            // Upload file baru
            $data['image_url'] = $this->uploadImage(
                $request->file('image'),
                str()->slug($request->name)
            );
        }

        // Simpan tags sementara
        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        // Update certificate
        $certificate->update($data);

        // Sync tags (hapus yang lama, tambahin yang baru)
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
        $this->deleteImage($certificate->image_url);
        $certificate->delete();

        return redirect()
            ->route('admin.certificate.index')
            ->with('success', 'Sertifikat berhasil dihapus!');
    }

    // ==================== Private Methods ====================

    /**
     * Upload image atau PDF file.
     */
    private function uploadImage($file, string $slug): string
    {
        $filename = sprintf(
            '%s-%s.%s',
            $slug,
            time(),
            $file->extension()
        );

        return $file->storeAs(
            self::IMAGE_PATH,
            $filename,
            self::STORAGE_DISK
        );
    }

    /**
     * Delete image atau PDF file.
     */
    private function deleteImage(?string $imagePath): bool
    {
        if (!$imagePath || filter_var($imagePath, FILTER_VALIDATE_URL)) {
            return false;
        }

        if (Storage::disk(self::STORAGE_DISK)->exists($imagePath)) {
            return Storage::disk(self::STORAGE_DISK)->delete($imagePath);
        }

        return false;
    }

    /**
     * 🔥 Get file type (pdf atau image) dari file path.
     */
    private function getFileType(?string $filePath): string
    {
        if (!$filePath) {
            return 'image';
        }

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        return $extension === 'pdf' ? 'pdf' : 'image';
    }
}
