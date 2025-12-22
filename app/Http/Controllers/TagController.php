<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTagRequest;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Get all tags (untuk dropdown).
     */
    public function index()
    {
        $tags = Tag::orderBy('name')->get()->map(fn($tag) => [
            'value' => $tag->id,
            'label' => $tag->name,
            'color' => $tag->color,
        ]);

        return response()->json($tags);
    }

    /**
     * Create tag baru (dipanggil dari form Certificate).
     */
    public function store(StoreTagRequest $request)
    {
        $data = $request->validated();

        // Default color kalau ga diisi
        if (empty($data['color'])) {
            $colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
            $data['color'] = $colors[array_rand($colors)];
        }

        $tag = Tag::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Tag berhasil dibuat!',
            'data' => [
                'value' => $tag->id,
                'label' => $tag->name,
                'color' => $tag->color,
            ],
        ], 201);
    }

    /**
     * Delete tag.
     */
    public function destroy(Tag $tag)
    {
        $tag->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tag berhasil dihapus!',
        ]);
    }
}
