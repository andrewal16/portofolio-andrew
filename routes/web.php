<?php

use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// ============================================================================
// 🔐 ADMIN ROUTES - HARUS LOGIN DULU!
// ============================================================================
Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth:sanctum', 'verified']) // ✅ WAJIB LOGIN
    ->group(function () {
        // Dashboard (optional)
        Route::get('/dashboard', function () {
            return redirect()->route('admin.project.index');
        })->name('dashboard');

        // Projects
        Route::resource('project', ProjectController::class)->except(['show']);

        // Certificates
        Route::resource('certificate', CertificateController::class)->except(['show']);

        // Blog Posts (CRUD lengkap)
        Route::resource('blog-posts', BlogPostController::class);

        // Toggle publish status
        Route::patch('blog-posts/{blog_post}/toggle-publish', [BlogPostController::class, 'togglePublish'])
            ->name('blog-posts.toggle-publish');

        // Tag management (API)
        Route::prefix('tags')->name('tags.')->group(function () {
            Route::get('/', [TagController::class, 'index'])->name('index');
            Route::post('/', [TagController::class, 'store'])->name('store');
            Route::delete('/{tag}', [TagController::class, 'destroy'])->name('destroy');
        });
    });

// ============================================================================
// 🌐 PUBLIC ROUTES (untuk menampilkan blog ke visitor)
// ============================================================================
Route::post('/contact/send', [PortfolioController::class, 'sendMessage'])->name('contact.send');

// Tampilkan detail project dengan blog posts-nya
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

Route::get('/portfolio/project/{slug}', [PortfolioController::class, 'show'])
    ->name('portfolio.project.show');

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

Route::get('/portofolio', function () {
    return redirect('/portfolio');
});

Route::get('/portfolio', [PortfolioController::class, 'index'])
    ->name('portfolio.index');

Route::get('/portfolio/blog/{slug}', [PortfolioController::class, 'showBlog'])
    ->name('portfolio.blog.show');

require __DIR__.'/settings.php';
