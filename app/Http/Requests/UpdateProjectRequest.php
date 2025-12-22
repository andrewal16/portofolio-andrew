<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $projectId = $this->route('project')->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('projects', 'slug')->ignore($projectId),
            ],
            'excerpt' => ['required', 'string'],
            
            // ✅ Untuk update, thumbnail opsional
            'thumbnail' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp,gif',
                'max:2048',
            ],

            'demo_url' => ['nullable', 'url', 'max:255'],
            'repo_url' => ['nullable', 'url', 'max:255'],
            'started_at' => ['required', 'date'],
            'finished_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'status' => ['required', Rule::in(['ongoing', 'completed', 'upcoming', 'paused'])],
            'type' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul project wajib diisi.',
            'excerpt.required' => 'Deskripsi singkat wajib diisi.',
            'thumbnail.image' => 'File harus berupa gambar.',
            'thumbnail.mimes' => 'Format gambar harus: jpeg, jpg, png, webp, atau gif.',
            'thumbnail.max' => 'Ukuran gambar maksimal 2MB.',
            'started_at.required' => 'Tanggal mulai wajib diisi.',
            'finished_at.after_or_equal' => 'Tanggal selesai harus setelah tanggal mulai.',
        ];
    }
}
