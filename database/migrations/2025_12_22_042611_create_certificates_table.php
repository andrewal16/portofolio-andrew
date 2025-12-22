<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama sertifikat
            $table->string('issuer'); // Penerbit (Dicoding, Coursera, dll)
            $table->date('issued_at'); // Tanggal terbit
            $table->string('credential_id')->nullable(); // Nomor sertifikat
            $table->string('credential_url')->nullable(); // Link ke platform
            $table->string('image_url')->nullable(); // Path file gambar
            $table->timestamps();

            // Index untuk performa query
            $table->index('issuer');
            $table->index('issued_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
