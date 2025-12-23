<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBlogPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Sesuaikan dengan policy kamu nanti
    }

    /**
     * Get the validation rules that apply to the request.
     */
   // StoreBlogPostRequest.php & UpdateBlogPostRequest.php
public function rules(): array
{
    return [
        'project_id' => ['required', 'exists:projects,id'],
        'title' => ['required', 'string', 'max:255'],
        'slug' => ['nullable', 'string', 'max:255', 'unique:blog_posts,slug'],
        'excerpt' => ['nullable', 'string', 'max:500'], // ✅ TAMBAHKAN
        'content' => ['required', 'string'],
        'is_published' => ['boolean'],
        // published_at di-handle otomatis oleh Model boot events
    ];
}

    /**
     * Custom error messages
     */
    public function messages(): array
    {
        return [
            'project_id.required' => 'Project harus dipilih.',
            'project_id.exists' => 'Project tidak ditemukan.',
            'title.required' => 'Judul blog post wajib diisi.',
            'title.max' => 'Judul maksimal 255 karakter.',
            'slug.unique' => 'Slug sudah digunakan.',
            'content.required' => 'Konten blog post wajib diisi.',
        ];
    }
}
