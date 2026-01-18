<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Tag;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $query = Certificate::with('tags')->ordered();

        // Filter by category
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        $certificates = $query->paginate($request->get('per_page', 10))
            ->through(fn($cert) => [
                'id' => $cert->id,
                'name' => $cert->name,
                'issuer' => $cert->issuer,
                'issued_at' => $cert->issued_at->format('Y-m-d'),
                'issued_year' => $cert->issued_year,
                'credential_id' => $cert->credential_id,
                'credential_url' => $cert->credential_url,
                'image_url' => $cert->image_full_url,
                'display_order' => $cert->display_order,
                'category' => $cert->category,
                'category_label' => $cert->category_label,
                'category_color' => $cert->category_color,
                'file_type' => $cert->image_url && str_ends_with(strtolower($cert->image_url), '.pdf') ? 'pdf' : 'image',
                'tags' => $cert->tags->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                ]),
            ]);

        return Inertia::render('Admin/Certificate/Index', [
            'certificates' => $certificates,
            'categoryOptions' => Certificate::getCategoryOptions(),
            'filters' => [
                'category' => $request->category,
            ],
        ]);
    }

    public function create()
    {
        $availableTags = Tag::all()->map(fn($tag) => [
            'value' => $tag->id,
            'label' => $tag->name,
            'color' => $tag->color,
        ]);

        return Inertia::render('Admin/Certificate/CertificateForm', [
            'typeForm' => 'create',
            'certificate' => null,
            'availableTags' => $availableTags,
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
            'image' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:10240',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
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
            'category' => $validated['category'] ?? Certificate::CATEGORY_LEARNING,
        ]);

        if (!empty($validated['tags'])) {
            $certificate->tags()->sync($validated['tags']);
        }

        return redirect()->route('admin.certificate.index')
            ->with('success', 'Certificate created successfully!');
    }

    public function edit(Certificate $certificate)
    {
        $certificate->load('tags');

        $availableTags = Tag::all()->map(fn($tag) => [
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
                'category' => $certificate->category,
                'tags' => $certificate->tags->pluck('id')->toArray(),
            ],
            'availableTags' => $availableTags,
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
            'tags.*' => 'exists:tags,id',
            'category' => 'nullable|in:learning,competition',
        ]);

        $imageUrl = $certificate->image_url;
        if ($request->hasFile('image')) {
            // Delete old image
            if ($certificate->image_url) {
                $this->deleteFromCloudinary($certificate->image_url);
            }
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

        return redirect()->route('admin.certificate.index')
            ->with('success', 'Certificate updated successfully!');
    }

    public function destroy(Certificate $certificate)
    {
        $certificate->delete();
        return redirect()->route('admin.certificate.index')
            ->with('success', 'Certificate deleted successfully!');
    }

    // ✅ NEW: Reorder Certificates
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

    // ==================== CLOUDINARY HELPERS ====================
    private function uploadToCloudinary($file): ?string
    {
        try {
            $options = ['folder' => 'certificates'];
            
            if ($file->getClientOriginalExtension() === 'pdf') {
                $options['resource_type'] = 'raw';
            }

            $result = Cloudinary::upload($file->getRealPath(), $options);
            return $result->getSecurePath();
        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            return null;
        }
    }

    private function deleteFromCloudinary(string $url): void
    {
        try {
            $path = parse_url($url, PHP_URL_PATH);
            if ($path && str_contains($path, 'certificates/')) {
                preg_match('/(certificates\/[^\.]+)/', $path, $matches);
                if (isset($matches[1])) {
                    Cloudinary::destroy($matches[1]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Cloudinary delete failed: ' . $e->getMessage());
        }
    }
}