<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCertificateRequest extends FormRequest
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
        return [
            // Basic Information
            // Tetap required karena ini field utama certificate
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
                'before_or_equal:today',
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
                'regex:/^https?:\/\//',
            ],

            // Image/PDF Upload
            // PERBEDAAN UTAMA: Di update, image SELALU nullable
            // Karena user tidak selalu ganti gambar saat edit
            'image' => [
                'nullable', // ✅ Selalu nullable di update
                'file',
                'mimes:jpg,jpeg,png,webp,pdf',
                function ($attribute, $value, $fail) {
                    if (!$value) {
                        return;
                    }

                    $extension = strtolower($value->getClientOriginalExtension());
                    $isPdf = $extension === 'pdf';

                    $maxSizeKB = $isPdf ? 10240 : 5120;
                    $maxSizeMB = $maxSizeKB / 1024;

                    if ($value->getSize() > $maxSizeKB * 1024) {
                        $fail("Ukuran {$attribute} maksimal {$maxSizeMB}MB untuk file " .
                              ($isPdf ? 'PDF' : 'gambar'));
                    }

                    if (!$isPdf) {
                        try {
                            $dimensions = getimagesize($value->getRealPath());
                            if ($dimensions) {
                                $width = $dimensions[0];
                                $height = $dimensions[1];

                                if ($width < 800 && $height < 800) {
                                    $fail('Gambar minimal 800px untuk salah satu sisinya');
                                }
                            }
                        } catch (\Exception $e) {
                            // Skip
                        }
                    }
                },
            ],

            // Tags
            'tags' => [
                'nullable',
                'array',
                'max:10',
            ],
            'tags.*' => [
                'integer',
                'exists:tags,id',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama sertifikat wajib diisi',
            'name.min' => 'Nama sertifikat minimal 3 karakter',
            'name.max' => 'Nama sertifikat maksimal 255 karakter',

            'issuer.required' => 'Nama penerbit sertifikat wajib diisi',
            'issuer.max' => 'Nama penerbit maksimal 255 karakter',

            'issued_at.required' => 'Tanggal terbit wajib diisi',
            'issued_at.date' => 'Format tanggal tidak valid',
            'issued_at.before_or_equal' => 'Tanggal terbit tidak boleh di masa depan',

            'credential_id.max' => 'Credential ID maksimal 100 karakter',

            'credential_url.url' => 'Format URL tidak valid',
            'credential_url.regex' => 'URL harus diawali dengan http:// atau https://',
            'credential_url.max' => 'URL maksimal 500 karakter',

            'image.file' => 'File tidak valid',
            'image.mimes' => 'Format file harus JPG, PNG, WEBP, atau PDF',

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
     */
    protected function prepareForValidation(): void
    {
        // Trim whitespace
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

        // Handle tags JSON string
        if ($this->has('tags') && is_string($this->tags)) {
            try {
                $tags = json_decode($this->tags, true);
                if (is_array($tags)) {
                    $this->merge(['tags' => $tags]);
                }
            } catch (\Exception $e) {
                // Let validation handle it
            }
        }
    }

    /**
     * Handle a passed validation attempt.
     * Method ini dipanggil SETELAH validation sukses.
     */
    protected function passedValidation(): void
    {
        // Log untuk audit trail (optional tapi recommended)
        logger()->info('Certificate update validation passed', [
            'certificate_id' => $this->route('certificate')?->id,
            'user_id' => auth()->id(),
            'has_new_image' => $this->hasFile('image'),
        ]);
    }
}
