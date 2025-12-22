<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt'); // Ringkasan pendek

            // Kolom Link & Gambar
            $table->string('thumbnail_url')->nullable();
            $table->string('demo_url')->nullable();
            $table->string('repo_url')->nullable();

            // Kolom Meta
            $table->date('started_at');
            $table->date('finished_at')->nullable();
            $table->enum('status', ['ongoing', 'completed', 'maintained'])->default('ongoing');
            $table->enum('type', ['web_app', 'mobile_app', 'data_science', 'research']);

            $table->timestamps();
            $table->softDeletes(); // Agar data tidak hilang permanen kalau terhapus
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
