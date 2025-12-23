<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTagRequest;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TagController extends Controller
{
    /**
     * Get all tags (untuk dropdown atau listing).
     *
     * Endpoint ini support 2 format response:
     * - JSON: untuk fetch API dari frontend
     * - Inertia: untuk render halaman tags (jika ada)
     *
     * @return JsonResponse|array
     */
    public function index(Request $request)
    {
        try {
            $tags = Tag::query()
                ->orderBy('name')
                ->get()
                ->map(fn ($tag) => [
                    'value' => $tag->id,
                    'label' => $tag->name,
                    'color' => $tag->color,
                    'slug' => $tag->slug,
                    'certificates_count' => $tag->certificates()->count(),
                ]);

            // Jika request dari fetch API (expect JSON)
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $tags,
                ]);
            }

            // Jika request dari Inertia (render page)
            return inertia('Admin/Tags/Index', [
                'tags' => $tags,
            ]);

        } catch (\Exception $e) {
            Log::error('TagController@index error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengambil data tags.',
                ], 500);
            }

            return back()->with('error', 'Gagal mengambil data tags.');
        }
    }

    /**
     * Store a newly created tag.
     *
     * ⚠️ PENTING: Method ini dipanggil via fetch API dari modal,
     * jadi HARUS return JSON, bukan redirect!
     *
     * @return JsonResponse|RedirectResponse
     */
    public function store(StoreTagRequest $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            // Set default color jika kosong
            if (empty($data['color'])) {
                $data['color'] = $this->getRandomColor();
            }

            // Create tag
            $tag = Tag::create($data);

            DB::commit();

            // Log activity (optional, tapi bagus untuk audit)
            Log::info('Tag created', [
                'tag_id' => $tag->id,
                'name' => $tag->name,
                'user_id' => auth()->id(),
            ]);

            // ✅ DETEKSI: Fetch API atau Inertia Form?
            if ($request->wantsJson() || $request->expectsJson()) {
                // Response untuk fetch API (dari modal Certificate)
                return response()->json([
                    'success' => true,
                    'message' => 'Tag berhasil dibuat!',
                    'data' => [
                        'value' => $tag->id,
                        'label' => $tag->name,
                        'color' => $tag->color,
                        'slug' => $tag->slug,
                    ],
                ], 201); // 201 = Created
            }

            // Response untuk Inertia Form (jika dipanggil dari halaman tags)
            return redirect()
                ->back()
                ->with('success', 'Tag berhasil dibuat!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();

            // Validation error (handled by Laravel)
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('TagController@store error: '.$e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat tag. '.$e->getMessage(),
                ], 500);
            }

            return back()
                ->withInput()
                ->with('error', 'Gagal membuat tag.');
        }
    }

    /**
     * Update the specified tag.
     *
     * @return JsonResponse|RedirectResponse
     */
    public function update(StoreTagRequest $request, Tag $tag)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            // Update tag
            $tag->update($data);

            DB::commit();

            Log::info('Tag updated', [
                'tag_id' => $tag->id,
                'name' => $tag->name,
                'user_id' => auth()->id(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tag berhasil diupdate!',
                    'data' => [
                        'value' => $tag->id,
                        'label' => $tag->name,
                        'color' => $tag->color,
                        'slug' => $tag->slug,
                    ],
                ]);
            }

            return redirect()
                ->back()
                ->with('success', 'Tag berhasil diupdate!');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('TagController@update error: '.$e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal update tag.',
                ], 500);
            }

            return back()
                ->withInput()
                ->with('error', 'Gagal update tag.');
        }
    }

    /**
     * Remove the specified tag.
     *
     * ⚠️ CATATAN: Karena tag punya relasi many-to-many dengan certificates,
     * Laravel akan otomatis hapus record di pivot table (certificate_tag).
     *
     * @return JsonResponse|RedirectResponse
     */
    public function destroy(Request $request, Tag $tag)
    {
        DB::beginTransaction();

        try {
            $tagName = $tag->name; // Simpan dulu sebelum dihapus

            // Check: Apakah tag masih dipakai?
            $certificatesCount = $tag->certificates()->count();

            if ($certificatesCount > 0) {
                $message = "Tag '{$tagName}' masih digunakan oleh {$certificatesCount} sertifikat. Hapus relasi dulu!";

                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                    ], 422); // 422 = Unprocessable Entity
                }

                return back()->with('error', $message);
            }

            // Delete tag
            $tag->delete();

            DB::commit();

            Log::info('Tag deleted', [
                'tag_name' => $tagName,
                'user_id' => auth()->id(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => "Tag '{$tagName}' berhasil dihapus!",
                ]);
            }

            return redirect()
                ->back()
                ->with('success', "Tag '{$tagName}' berhasil dihapus!");

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('TagController@destroy error: '.$e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menghapus tag.',
                ], 500);
            }

            return back()->with('error', 'Gagal menghapus tag.');
        }
    }

    /**
     * Force delete tag beserta relasinya.
     *
     * Gunakan ini kalau mau hapus tag paksa,
     * bahkan jika masih ada sertifikat yang pakai.
     *
     * @return JsonResponse|RedirectResponse
     */
    public function forceDestroy(Request $request, Tag $tag)
    {
        DB::beginTransaction();

        try {
            $tagName = $tag->name;
            $certificatesCount = $tag->certificates()->count();

            // Detach semua relasi dulu
            $tag->certificates()->detach();

            // Baru delete tag
            $tag->delete();

            DB::commit();

            $message = "Tag '{$tagName}' berhasil dihapus! ".
                       "({$certificatesCount} relasi sertifikat dihapus)";

            Log::warning('Tag force deleted', [
                'tag_name' => $tagName,
                'certificates_affected' => $certificatesCount,
                'user_id' => auth()->id(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                ]);
            }

            return redirect()
                ->back()
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('TagController@forceDestroy error: '.$e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menghapus tag.',
                ], 500);
            }

            return back()->with('error', 'Gagal menghapus tag.');
        }
    }

    // ==================== Private Helper Methods ====================

    /**
     * Get random color untuk tag.
     *
     * @return string Hex color code
     */
    private function getRandomColor(): string
    {
        $colors = [
            '#1890ff', // Blue
            '#52c41a', // Green
            '#faad14', // Orange
            '#f5222d', // Red
            '#722ed1', // Purple
            '#13c2c2', // Cyan
            '#eb2f96', // Magenta
            '#fa8c16', // Volcano
            '#a0d911', // Lime
            '#2f54eb', // Geek Blue
        ];

        return $colors[array_rand($colors)];
    }
}
