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
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            
            // Basic Info
            $table->string('slug')->unique();
            $table->string('company_name');
            $table->string('company_logo')->nullable(); // URL/path to logo
            $table->string('position');
            $table->enum('employment_type', ['full-time', 'part-time', 'contract', 'internship', 'freelance']);
            
            // Duration
            $table->date('start_date');
            $table->date('end_date')->nullable(); // NULL = currently working
            
            // Content
            $table->text('description'); // Short description untuk card
            $table->longText('detailed_description')->nullable(); // Full content untuk detail page
            
            // Location
            $table->string('location');
            $table->boolean('is_remote')->default(false);
            
            // Achievements & Metrics (JSON untuk flexibility)
            $table->json('key_achievements')->nullable(); // Array of achievement strings
            $table->json('metrics')->nullable(); // e.g., ["10,000+ users", "33% improvement"]
            
            // Tech Stack
            $table->json('tech_stack')->nullable(); // Array of technologies
            
            // Media Gallery (untuk detail page)
            $table->json('gallery')->nullable(); // Array of image URLs
            
            // SEO & Meta
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            
            // Status & Ordering
            $table->boolean('is_featured')->default(false); // Highlight di timeline
            $table->boolean('is_published')->default(true);
            $table->integer('display_order')->default(0); // Manual sorting
            
            $table->timestamps();
            
            // Indexes untuk performance
            $table->index('slug');
            $table->index('start_date');
            $table->index('is_published');
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};