<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Ubah type jadi nullable (opsional)
            $table->string('type')->nullable()->change();

            // BONUS: Tambah index untuk performa query
            $table->index('status');
            $table->index('started_at');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('type')->nullable(false)->change();

            $table->dropIndex(['status']);
            $table->dropIndex(['started_at']);
        });
    }
};
