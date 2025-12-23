<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTagRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Sesuaikan dengan policy jika perlu
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rules berbeda untuk create vs update:
     * - Create: name harus unique
     * - Update: name harus unique, kecuali untuk tag yang sedang diedit
     */
    public function rules(): array
    {
        $tagId = $this->route('tag')?->id; // Ambil ID tag dari route (untuk update)

        return [
            // Name: required, max 50 char, unique (kecuali untuk tag ini sendiri)
            'name' => [
                'required',
                'string',
                'max:50',
                'min:2',
                Rule::unique('tags', 'name')->ignore($tagId),
            ],

            // Color: optional, must be hex color format
            'color' => [
                'nullable',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/', // Format: #1890ff
            ],

            // Slug: optional (auto-generated di model), tapi validasi kalau diisi
            'slug' => [
                'nullable',
                'string',
                'max:50',
                'alpha_dash', // Only letters, numbers, dashes, underscores
                Rule::unique('tags', 'slug')->ignore($tagId),
            ],
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            // Name
            'name.required' => 'Nama tag wajib diisi.',
            'name.min' => 'Nama tag minimal :min karakter.',
            'name.max' => 'Nama tag maksimal :max karakter.',
            'name.unique' => 'Tag dengan nama ini sudah ada. Gunakan nama lain!',

            // Color
            'color.regex' => 'Format warna harus hex code (contoh: #1890ff).',

            // Slug
            'slug.alpha_dash' => 'Slug hanya boleh huruf, angka, dash (-), dan underscore (_).',
            'slug.unique' => 'Slug ini sudah digunakan.',
        ];
    }

    /**
     * Get custom attribute names for error messages.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama tag',
            'color' => 'warna tag',
            'slug' => 'slug tag',
        ];
    }

    /**
     * Prepare data for validation.
     *
     * Method ini dipanggil SEBELUM validation.
     * Gunakan untuk clean/transform input data.
     */
    protected function prepareForValidation(): void
    {
        // Trim whitespace dari name
        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }

        // Lowercase & trim color
        if ($this->has('color') && $this->color) {
            $color = strtolower(trim($this->color));

            // Tambahin # kalau user lupa
            if (! str_starts_with($color, '#')) {
                $color = '#'.$color;
            }

            $this->merge([
                'color' => $color,
            ]);
        }

        // Clean slug kalau ada
        if ($this->has('slug') && $this->slug) {
            $this->merge([
                'slug' => strtolower(trim($this->slug)),
            ]);
        }
    }

    /**
     * Handle a passed validation attempt.
     *
     * Method ini dipanggil SETELAH validation sukses.
     */
    protected function passedValidation(): void
    {
        // Log untuk debugging (optional)
        if (app()->environment('local')) {
            logger()->info('Tag validation passed', [
                'data' => $this->validated(),
                'user_id' => auth()->id(),
            ]);
        }
    }

    
}
