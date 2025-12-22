<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();

            // Relasi Opsional ke Project
            // Jika dihapus projectnya, post ini jadi NULL project_id-nya (tidak ikut terhapus)
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content'); // Isi artikel panjang

            // Status Publish
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
