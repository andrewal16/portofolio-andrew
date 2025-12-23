<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBlogPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        // ✅ PERBAIKAN: Ambil parameter dari route dengan benar
        // Laravel resource route menggunakan singular snake_case
        // Contoh: 'blog-posts' resource -> parameter 'blog_post'
        $blogPost = $this->route('blog_post');

        // ✅ Safety check: Bisa jadi Model object atau ID langsung
        $postId = $blogPost instanceof \App\Models\BlogPost
            ? $blogPost->id
            : $blogPost;

        return [
            'project_id' => ['required', 'exists:projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                // ✅ Ignore ID saat cek unique (tidak bentrok dengan diri sendiri)
                Rule::unique('blog_posts', 'slug')->ignore($postId),
            ],
            'excerpt' => ['nullable', 'string', 'max:500'], // ✅ TAMBAHAN
            'content' => ['required', 'string'],
            'is_published' => ['boolean'],
        ];
    }

    /**
     * ✅ PERBAIKAN: Prepare data sebelum validasi
     */
    protected function prepareForValidation(): void
    {
        // ✅ Handle is_published (convert string 'false' jadi boolean)
        $this->merge([
            'is_published' => filter_var(
                $this->input('is_published', false),
                FILTER_VALIDATE_BOOLEAN
            ),
        ]);

        // ✅ Trim whitespace dari slug (kalau ada)
        if ($this->has('slug') && $this->slug) {
            $this->merge([
                'slug' => trim($this->slug),
            ]);
        }
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
            'slug.max' => 'Slug maksimal 255 karakter.',
            'excerpt.max' => 'Excerpt maksimal 500 karakter.',
            'content.required' => 'Konten blog post wajib diisi.',
        ];
    }

    /**
     * ✅ Custom attribute names untuk error messages
     */
    public function attributes(): array
    {
        return [
            'project_id' => 'project',
            'title' => 'judul',
            'slug' => 'slug',
            'excerpt' => 'ringkasan',
            'content' => 'konten',
            'is_published' => 'status publikasi',
        ];
    }
}
