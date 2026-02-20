<?php

use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;

// ============================================================================
// 🏠 ROOT REDIRECT
// ============================================================================
Route::get('/', function () {
    return redirect('/portfolio');
})->name('home');

// ============================================================================
// 🌐 PUBLIC PORTFOLIO ROUTES
// ============================================================================
Route::get('/portfolio', [PortfolioController::class, 'index'])
    ->name('portfolio.index');

Route::get('/portfolio/project/{slug}', [PortfolioController::class, 'show'])
    ->name('portfolio.project.show');

Route::get('/portfolio/experience/{slug}', [PortfolioController::class, 'showExperience'])
    ->name('portfolio.experience.show');

Route::get('/portfolio/blog/{slug}', [PortfolioController::class, 'showBlog'])
    ->name('portfolio.blog.show');

// Redirect typo
Route::get('/portofolio', fn() => redirect('/portfolio', 301));

// ============================================================================
// 📡 PUBLIC API ROUTES — PORTFOLIO DATA ENDPOINTS
// ============================================================================
// ⚠️ INI YANG SEBELUMNYA TIDAK ADA!
// Frontend memanggil URL ini saat user klik tab filter Projects/Certificates.
// Tanpa routes ini → 404 → UI "patah-patah" saat filter.
//
// Kenapa di web.php bukan api.php?
// Karena Laravel Inertia app biasanya menggunakan session-based auth,
// dan api.php menggunakan middleware 'api' (stateless, token-based).
// Dengan prefix '/api/portfolio' di web.php, kita tetap punya akses
// ke session & CSRF jika diperlukan nanti, sambil memisahkan
// JSON endpoints dari Inertia pages secara visual.
// ============================================================================
Route::prefix('api/portfolio')->group(function () {

    // GET /api/portfolio/projects?type=Web+App&per_page=6&page=1
    Route::get('/projects', [PortfolioController::class, 'getProjects'])
        ->name('api.portfolio.projects');

    // GET /api/portfolio/certificates?category=learning&per_page=6&page=1
    Route::get('/certificates', [PortfolioController::class, 'getCertificates'])
        ->name('api.portfolio.certificates');
});

// ============================================================================
// 🎯 PROJECT & BLOG PUBLIC ROUTES (Legacy/Alternate URLs)
// ============================================================================
Route::get('/projects/{project:slug}', function (\App\Models\Project $project) {
    $project->load(['publishedBlogPosts' => function ($query) {
        $query->select('id', 'project_id', 'title', 'slug', 'content', 'published_at')
            ->latest('published_at');
    }]);

    return Inertia::render('Projects/Show', [
        'project' => [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'excerpt' => $project->excerpt,
            'thumbnail_url' => $project->thumbnail_full_url,
            'demo_url' => $project->demo_url,
            'repo_url' => $project->repo_url,
            'started_at' => $project->started_at?->format('Y-m-d'),
            'finished_at' => $project->finished_at?->format('Y-m-d'),
            'status' => $project->status,
            'blog_posts' => $project->publishedBlogPosts->map(fn ($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => Str::limit(strip_tags($post->content), 200),
                'published_at' => $post->published_at->format('d M Y'),
            ]),
        ],
    ]);
})->name('projects.show');

Route::get('/projects/{project:slug}/blog/{blogPost:slug}', function (
    \App\Models\Project $project,
    \App\Models\BlogPost $blogPost
) {
    abort_if($blogPost->project_id !== $project->id, 404);
    abort_if(! $blogPost->is_published, 404);

    return Inertia::render('Projects/BlogPost', [
        'project' => [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
        ],
        'blogPost' => [
            'id' => $blogPost->id,
            'title' => $blogPost->title,
            'slug' => $blogPost->slug,
            'content' => $blogPost->content,
            'published_at' => $blogPost->published_at->format('d F Y'),
        ],
    ]);
})->name('projects.blog-posts.show');

// Contact form
Route::post('/contact/send', [PortfolioController::class, 'sendMessage'])
    ->name('contact.send');

// ============================================================================
// 🔒 ADMIN ROUTES
// ============================================================================
Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth:sanctum', 'verified'])
    ->group(function () {
        Route::get('/dashboard', fn() => redirect()->route('admin.project.index'))
            ->name('dashboard');

        // Projects CRUD
        Route::resource('project', ProjectController::class)->except(['show']);

        // Experiences CRUD + Reorder
        Route::resource('experience', ExperienceController::class)->except(['show']);
        Route::post('experience/reorder', [ExperienceController::class, 'reorder'])
            ->name('experience.reorder');

        // Certificates CRUD
        Route::resource('certificate', CertificateController::class)->except(['show']);

        // Blog Posts CRUD
        Route::resource('blog-posts', BlogPostController::class);
        Route::patch('blog-posts/{blog_post}/toggle-publish', [BlogPostController::class, 'togglePublish'])
            ->name('blog-posts.toggle-publish');

        // Tags
        Route::prefix('tags')->name('tags.')->group(function () {
            Route::get('/', [TagController::class, 'index'])->name('index');
            Route::post('/', [TagController::class, 'store'])->name('store');
            Route::delete('/{tag}', [TagController::class, 'destroy'])->name('destroy');
        });

        // ================================================================
        // 🧹 CACHE MANAGEMENT (Optional, tapi sangat berguna)
        // ================================================================
        // Tombol "Clear Cache" di admin panel jika diperlukan
        Route::post('/cache/clear-portfolio', function () {
            PortfolioController::clearAllCache();
            return back()->with('success', 'Portfolio cache berhasil dihapus!');
        })->name('cache.clear-portfolio');
    });

// ============================================================================
// 🔧 SETTINGS & AUTH
// ============================================================================
require __DIR__.'/settings.php';

// ============================================================================
// 🚨 FALLBACK
// ============================================================================
Route::fallback(fn() => redirect('/portfolio'));
