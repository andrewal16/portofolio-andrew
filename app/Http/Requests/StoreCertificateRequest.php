<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCertificateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Sesuaikan dengan policy/guard kamu
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Basic Information (Required)
            'name' => [
                'required',
                'string',
                'max:255',
                'min:3',
            ],
            'issuer' => [
                'required',
                'string',
                'max:255',
            ],
            'issued_at' => [
                'required',
                'date',
                'before_or_equal:today', // Tidak boleh tanggal masa depan
            ],

            // Credential Information (Optional)
            'credential_id' => [
                'nullable',
                'string',
                'max:100',
            ],
            'credential_url' => [
                'nullable',
                'url',
                'max:500',
                'regex:/^https?:\/\//', // Harus pakai http:// atau https://
            ],

            // Image/PDF Upload (Optional untuk Create, tapi recommended)
            'image' => [
                'nullable', // Ganti jadi 'required' kalau mau wajib upload
                'file',
                'mimes:jpg,jpeg,png,webp,pdf',
                function ($attribute, $value, $fail) {
                    if (!$value) {
                        return;
                    }

                    // Validasi ukuran berbeda untuk PDF dan Image
                    $extension = strtolower($value->getClientOriginalExtension());
                    $isPdf = $extension === 'pdf';

                    // 10MB untuk PDF, 5MB untuk Image
                    $maxSizeKB = $isPdf ? 10240 : 5120;
                    $maxSizeMB = $maxSizeKB / 1024;

                    if ($value->getSize() > $maxSizeKB * 1024) {
                        $fail("Ukuran {$attribute} maksimal {$maxSizeMB}MB untuk file " .
                              ($isPdf ? 'PDF' : 'gambar'));
                    }

                    // Validasi dimensi untuk image (optional tapi recommended)
                    if (!$isPdf) {
                        try {
                            $dimensions = getimagesize($value->getRealPath());
                            if ($dimensions) {
                                $width = $dimensions[0];
                                $height = $dimensions[1];

                                // Minimal 800px untuk salah satu sisi
                                if ($width < 800 && $height < 800) {
                                    $fail('Gambar minimal 800px untuk salah satu sisinya');
                                }
                            }
                        } catch (\Exception $e) {
                            // Skip validation kalau gagal baca dimensi
                        }
                    }
                },
            ],

            // Tags (Many-to-Many Relationship)
            'tags' => [
                'nullable',
                'array',
                'max:10', // Maksimal 10 tags
            ],
            'tags.*' => [
                'integer',
                'exists:tags,id', // Tag harus exist di database
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Name
            'name.required' => 'Nama sertifikat wajib diisi',
            'name.min' => 'Nama sertifikat minimal 3 karakter',
            'name.max' => 'Nama sertifikat maksimal 255 karakter',

            // Issuer
            'issuer.required' => 'Nama penerbit sertifikat wajib diisi',
            'issuer.max' => 'Nama penerbit maksimal 255 karakter',

            // Issued Date
            'issued_at.required' => 'Tanggal terbit wajib diisi',
            'issued_at.date' => 'Format tanggal tidak valid',
            'issued_at.before_or_equal' => 'Tanggal terbit tidak boleh di masa depan',

            // Credential
            'credential_id.max' => 'Credential ID maksimal 100 karakter',
            'credential_url.url' => 'Format URL tidak valid',
            'credential_url.regex' => 'URL harus diawali dengan http:// atau https://',
            'credential_url.max' => 'URL maksimal 500 karakter',

            // Image/PDF
            'image.required' => 'File sertifikat wajib diupload',
            'image.file' => 'File tidak valid',
            'image.mimes' => 'Format file harus JPG, PNG, WEBP, atau PDF',

            // Tags
            'tags.array' => 'Format tags tidak valid',
            'tags.max' => 'Maksimal 10 tags',
            'tags.*.integer' => 'Tag ID harus berupa angka',
            'tags.*.exists' => 'Tag yang dipilih tidak valid',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama sertifikat',
            'issuer' => 'penerbit',
            'issued_at' => 'tanggal terbit',
            'credential_id' => 'credential ID',
            'credential_url' => 'credential URL',
            'image' => 'file sertifikat',
            'tags' => 'tags',
        ];
    }

    /**
     * Prepare the data for validation.
     * Method ini dipanggil sebelum validation.
     */
    protected function prepareForValidation(): void
    {
        // Trim whitespace dari string inputs
        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }

        if ($this->has('issuer')) {
            $this->merge([
                'issuer' => trim($this->issuer),
            ]);
        }

        // Convert empty tags array dari JSON string ke array
        if ($this->has('tags') && is_string($this->tags)) {
            try {
                $tags = json_decode($this->tags, true);
                if (is_array($tags)) {
                    $this->merge(['tags' => $tags]);
                }
            } catch (\Exception $e) {
                // Biarkan validation yang handle
            }
        }
    }
}
