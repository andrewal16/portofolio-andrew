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
    // Ambil parameter dari route.
    // Karena kita pakai resource 'blog-posts', parameternya biasanya 'blog_post'
    $post = $this->route('blog_post');

    // Pastikan kita dapat ID-nya, entah itu berupa object Model atau ID langsung
    $postId = $post instanceof \App\Models\BlogPost ? $post->id : $post;

    return [
        'project_id' => ['required', 'exists:projects,id'],
        'title' => ['required', 'string', 'max:255'],
        'slug' => [
            'nullable',
            'string',
            'max:255',
            // Ignore ID saat cek unique agar tidak bentrok dengan diri sendiri
            Rule::unique('blog_posts', 'slug')->ignore($postId),
        ],
        'content' => ['required', 'string'],
        'is_published' => ['boolean'],
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
