<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Untuk mencatat error jika upload gagal
use Inertia\Inertia;
use Illuminate\Support\Str;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $query = Certificate::with('tags')->ordered();

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        $certificates = $query->paginate($request->get('per_page', 10))
            ->through(fn($cert) => [
                'id' => $cert->id,
                'name' => $cert->name,
                'issuer' => $cert->issuer,
                'issued_at' => $cert->issued_at->format('Y-m-d'),
                'credential_url' => $cert->credential_url,
                'image_url' => $cert->image_url,
                'display_order' => $cert->display_order,
                'category' => $cert->category,
                'category_label' => $cert->category_label,
                'category_color' => $cert->category_color,
                // Deteksi file PDF atau Image untuk frontend
                'file_type' => str_ends_with(strtolower($cert->image_url), '.pdf') ? 'pdf' : 'image',
                'tags' => $cert->tags->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                ]),
            ]);

        return Inertia::render('Admin/Certificate/Index', [
            'certificates' => $certificates,
            'categoryOptions' => Certificate::getCategoryOptions(),
            'filters' => ['category' => $request->category],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Certificate/CertificateForm', [
            'typeForm' => 'create',
            'availableTags' => Tag::all()->map(fn($t) => ['value' => $t->id, 'label' => $t->name, 'color' => $t->color]),
            'categoryOptions' => Certificate::getCategoryOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'issuer' => 'required|string|max:255',
            'issued_at' => 'required|date',
            'credential_id' => 'nullable|string|max:255',
            'credential_url' => 'nullable|url|max:500',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:10240', // Max 10MB
            'tags' => 'nullable|array',
            'category' => 'nullable|in:learning,competition',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = $this->uploadToCloudinary($request->file('image'));
        }

        $certificate = Certificate::create([
            'name' => $validated['name'],
            'issuer' => $validated['issuer'],
            'issued_at' => $validated['issued_at'],
            'credential_id' => $validated['credential_id'] ?? null,
            'credential_url' => $validated['credential_url'] ?? null,
            'image_url' => $imageUrl,
            'category' => $validated['category'] ?? 'learning',
        ]);

        if (!empty($validated['tags'])) {
            $certificate->tags()->sync($validated['tags']);
        }

        return redirect()->route('admin.certificate.index')->with('success', 'Certificate created successfully!');
    }

    public function edit(Certificate $certificate)
    {
        $certificate->load('tags');
        
        return Inertia::render('Admin/Certificate/CertificateForm', [
            'typeForm' => 'edit',
            'certificate' => array_merge($certificate->toArray(), [
                'tags' => $certificate->tags->pluck('id')->toArray(),
                'issued_at' => $certificate->issued_at->format('Y-m-d'),
            ]),
            'availableTags' => Tag::all()->map(fn($t) => ['value' => $t->id, 'label' => $t->name, 'color' => $t->color]),
            'categoryOptions' => Certificate::getCategoryOptions(),
        ]);
    }

    public function update(Request $request, Certificate $certificate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'issuer' => 'required|string|max:255',
            'issued_at' => 'required|date',
            'credential_id' => 'nullable|string|max:255',
            'credential_url' => 'nullable|url|max:500',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:10240',
            'tags' => 'nullable|array',
            'category' => 'nullable|in:learning,competition',
        ]);

        $imageUrl = $certificate->image_url;

        // Cek jika user mengupload gambar baru
        if ($request->hasFile('image')) {
            // 1. Hapus gambar lama dari Cloudinary (Penting biar storage gak penuh)
            if ($certificate->image_url) {
                $this->deleteFromCloudinary($certificate->image_url);
            }
            // 2. Upload gambar baru
            $imageUrl = $this->uploadToCloudinary($request->file('image'));
        }

        $certificate->update([
            'name' => $validated['name'],
            'issuer' => $validated['issuer'],
            'issued_at' => $validated['issued_at'],
            'credential_id' => $validated['credential_id'] ?? null,
            'credential_url' => $validated['credential_url'] ?? null,
            'image_url' => $imageUrl,
            'category' => $validated['category'] ?? $certificate->category,
        ]);

        $certificate->tags()->sync($validated['tags'] ?? []);

        return redirect()->route('admin.certificate.index')->with('success', 'Certificate updated successfully!');
    }

    public function destroy(Certificate $certificate)
    {
        // Hapus file dari Cloudinary sebelum hapus data di database
        if ($certificate->image_url) {
            $this->deleteFromCloudinary($certificate->image_url);
        }

        $certificate->delete();
        return redirect()->route('admin.certificate.index')->with('success', 'Certificate deleted successfully!');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:certificates,id',
            'items.*.display_order' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            Certificate::where('id', $item['id'])->update([
                'display_order' => $item['display_order']
            ]);
        }

        return back()->with('success', 'Order updated successfully!');
    }

    // ==================== HELPER FUNCTIONS ====================

    /**
     * Upload file ke Cloudinary ke folder 'certificates'
     */
    private function uploadToCloudinary($file)
    {
        try {
            // Kita pakai method storeOnCloudinary yang otomatis
            $response = $file->storeOnCloudinary('certificates');
            return $response->getSecurePath(); // Mengembalikan URL HTTPS
        } catch (\Exception $e) {
            Log::error("Gagal Upload Cloudinary: " . $e->getMessage());
            return null; // Kembalikan null jika gagal, jangan bikin error 500
        }
    }

    /**
     * Hapus file dari Cloudinary berdasarkan URL
     */
    private function deleteFromCloudinary($url)
    {
        try {
            // Kita harus ekstrak Public ID dari URL
            // Contoh URL: https://res.cloudinary.com/demo/image/upload/v123456/certificates/namagambar.jpg
            // Public ID yang dibutuhkan: certificates/namagambar
            
            $path = parse_url($url, PHP_URL_PATH);
            
            // Regex ini mengambil string setelah 'upload/' dan versi 'v12345/'
            // Polanya mencari folder 'certificates' dan nama file setelahnya (tanpa ekstensi)
            preg_match('/(certificates\/[^\.]+)/', $path, $matches);
            
            if (isset($matches[1])) {
                $publicId = $matches[1];
                Cloudinary::destroy($publicId);
            }
        } catch (\Exception $e) {
            // Kita log saja errornya, jangan sampai user gagal delete sertifikat
            // hanya karena Cloudinary error
            Log::error("Gagal Hapus Cloudinary: " . $e->getMessage());
        }
    }
}