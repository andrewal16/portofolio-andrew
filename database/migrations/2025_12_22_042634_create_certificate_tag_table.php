<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('certificate_id')
                ->constrained('certificates')
                ->onDelete('cascade'); // Kalau certificate dihapus, relasi ikut terhapus
            $table->foreignId('tag_id')
                ->constrained('tags')
                ->onDelete('cascade'); // Kalau tag dihapus, relasi ikut terhapus
            $table->timestamps();

            // Composite unique: satu certificate ga bisa punya tag yang sama 2x
            $table->unique(['certificate_id', 'tag_id']);

            // Index untuk performa
            $table->index('certificate_id');
            $table->index('tag_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_tag');
    }
};
