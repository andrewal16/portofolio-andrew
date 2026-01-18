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
Route::get('/', fn() => redirect('/portfolio'))->name('home');

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

// ✅ NEW: API endpoint for AJAX pagination & filtering
Route::get('/api/portfolio/projects', [PortfolioController::class, 'getProjects'])
    ->name('api.portfolio.projects');

Route::get('/api/portfolio/certificates', [PortfolioController::class, 'getCertificates'])
    ->name('api.portfolio.certificates');

// Redirect typo
Route::get('/portofolio', fn() => redirect('/portfolio', 301));

// ============================================================================
// 🎯 PROJECT & BLOG PUBLIC ROUTES
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
            'blog_posts' => $project->publishedBlogPosts->map(fn($post) => [
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
    abort_if(!$blogPost->is_published, 404);

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
        // Dashboard
        Route::get('/dashboard', fn() => redirect()->route('admin.project.index'))
            ->name('dashboard');

        // ✅ Projects CRUD + Reorder
        Route::resource('project', ProjectController::class)->except(['show']);
        Route::post('project/reorder', [ProjectController::class, 'reorder'])
            ->name('project.reorder');

        // ✅ Experiences CRUD + Reorder
        Route::resource('experience', ExperienceController::class)->except(['show']);
        Route::post('experience/reorder', [ExperienceController::class, 'reorder'])
            ->name('experience.reorder');

        // ✅ Certificates CRUD + Reorder
        Route::resource('certificate', CertificateController::class)->except(['show']);
        Route::post('certificate/reorder', [CertificateController::class, 'reorder'])
            ->name('certificate.reorder');

        // Blog Posts CRUD
        Route::resource('blog-posts', BlogPostController::class);
        Route::patch('blog-posts/{blog_post}/toggle-publish', [BlogPostController::class, 'togglePublish'])
            ->name('blog-posts.toggle-publish');

        // Tag management
        Route::prefix('tags')->name('tags.')->group(function () {
            Route::get('/', [TagController::class, 'index'])->name('index');
            Route::post('/', [TagController::class, 'store'])->name('store');
            Route::delete('/{tag}', [TagController::class, 'destroy'])->name('destroy');
        });
    });

// ============================================================================
// 🔧 SETTINGS & AUTH ROUTES
// ============================================================================
require __DIR__.'/settings.php';

// ============================================================================
// 🚨 FALLBACK
// ============================================================================
Route::fallback(fn() => redirect('/portfolio'));