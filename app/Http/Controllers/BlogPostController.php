<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBlogPostRequest;
use App\Http\Requests\UpdateBlogPostRequest;
use App\Models\BlogPost;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogPostController extends Controller
{
    /**
     * Display a listing of blog posts.
     */
    public function index(): Response
    {
        $blogPosts = BlogPost::with('project:id,title,slug')
            ->latest()
            ->paginate(10)
            ->through(fn ($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => Str::limit(strip_tags($post->content), 150),
                'is_published' => $post->is_published,
                'published_at' => $post->published_at?->format('Y-m-d H:i'),
                'created_at' => $post->created_at->format('Y-m-d H:i'),
                'project' => [
                    'id' => $post->project->id,
                    'title' => $post->project->title,
                    'slug' => $post->project->slug,
                ],
            ]);

        return Inertia::render('Admin/BlogPost/Index', [
            'blogPosts' => $blogPosts,
        ]);
    }

    /**
     * Show the form for creating a new blog post.
     */
    public function create(): Response
    {
        $projects = Project::select('id', 'title', 'slug')
            ->orderBy('title')
            ->get()
            ->map(fn ($project) => [
                'value' => $project->id,
                'label' => $project->title,
            ]);

        return Inertia::render('Admin/BlogPost/BlogPostForm', [
            'typeForm' => 'create',
            'blogPost' => null,
            'projects' => $projects,
        ]);
    }

    /**
     * Store a newly created blog post.
     */
    public function store(StoreBlogPostRequest $request): RedirectResponse
    {
        $blogPost = BlogPost::create($request->validated());

        // ✅ Refresh untuk pastikan slug sudah ter-generate
        $blogPost->refresh();

        return redirect()
            ->route('admin.blog-posts.index') // Lebih aman redirect ke index
            ->with('success', 'Blog post berhasil dibuat!');
    }

    /**
     * ✅ NEW: Show preview of blog post (draft or published)
     */
    public function show(BlogPost $blogPost): Response
    {
        // Load relationship
        $blogPost->load('project:id,title,slug');

        return Inertia::render('Admin/BlogPost/BlogPostPreview', [
            'blogPost' => [
                'id' => $blogPost->id,
                'title' => $blogPost->title,
                'slug' => $blogPost->slug,
                'content' => $blogPost->content,
                'is_published' => $blogPost->is_published,
                'published_at' => $blogPost->published_at?->format('d F Y, H:i'),
                'created_at' => $blogPost->created_at->format('d F Y, H:i'),
            ],
            'project' => [
                'id' => $blogPost->project->id,
                'title' => $blogPost->project->title,
                'slug' => $blogPost->project->slug,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified blog post.
     */
    public function edit(BlogPost $blogPost): Response
    {
        $blogPost->load('project:id,title,slug');

        $projects = Project::select('id', 'title', 'slug')
            ->orderBy('title')
            ->get()
            ->map(fn ($project) => [
                'value' => $project->id,
                'label' => $project->title,
            ]);

        return Inertia::render('Admin/BlogPost/BlogPostForm', [
            'typeForm' => 'edit',
            'blogPost' => [
                'id' => $blogPost->id,
                'project_id' => $blogPost->project_id,
                'title' => $blogPost->title,
                'slug' => $blogPost->slug,
                'content' => $blogPost->content,
                'is_published' => $blogPost->is_published,
                'published_at' => $blogPost->published_at?->format('Y-m-d H:i:s'),
                'created_at' => $blogPost->created_at->format('Y-m-d H:i:s'),
                'project' => [
                    'id' => $blogPost->project->id,
                    'title' => $blogPost->project->title,
                ],
            ],
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified blog post.
     */
    public function update(UpdateBlogPostRequest $request, BlogPost $blogPost): RedirectResponse
    {
        $blogPost->update($request->validated());

        return redirect()
            ->route('admin.blog-posts.edit', $blogPost)
            ->with('success', 'Blog post berhasil diupdate!');
    }

    /**
     * Remove the specified blog post.
     */
    public function destroy(BlogPost $blogPost): RedirectResponse
    {
        $blogPost->delete();

        return redirect()
            ->route('admin.blog-posts.index')
            ->with('success', 'Blog post berhasil dihapus!');
    }

    /**
     * Toggle publish status
     */
    public function togglePublish(BlogPost $blogPost): RedirectResponse
    {
        $blogPost->update([
            'is_published' => ! $blogPost->is_published,
        ]);

        $status = $blogPost->is_published ? 'dipublish' : 'di-unpublish';

        return back()->with('success', "Blog post berhasil {$status}!");
    }
}
