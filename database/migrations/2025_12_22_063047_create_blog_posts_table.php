<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();

            // Foreign key ke projects
            $table->foreignId('project_id')
                ->constrained('projects')
                ->cascadeOnDelete(); // Kalau project dihapus, blog posts ikut terhapus

            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content'); // Untuk konten TinyMCE yang panjang

            // Status publikasi
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();

            $table->timestamps();

            // Index untuk performa query
            $table->index(['project_id', 'is_published']);
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
