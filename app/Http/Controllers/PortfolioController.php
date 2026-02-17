<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Certificate;
use App\Models\Contact;
use App\Models\Experience;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Portfolio/Index', [
            'projects' => Project::ordered()->limit(6)->get()->map(fn($p) => $this->transformProject($p)),
            'certificates' => Certificate::ordered()->limit(6)->get()->map(fn($c) => $this->transformCertificate($c)),
            'experiences' => Experience::published()->timeline()->get()->map(fn($e) => $this->transformExperience($e)),
            'recent_blogs' => BlogPost::published()->latestPublished()->limit(3)->get()->map(fn($b) => $this->transformBlog($b)),
        ]);
    }

    // Mendapatkan data project via AJAX/Inertia Reload
    public function getProjects(Request $request)
    {
        $query = Project::query()->ordered();

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $projects = $query->paginate($request->get('per_page', 6))
            ->through(fn($p) => $this->transformProject($p));

        return response()->json($projects);
    }

    // Detail Project
    public function show($slug)
    {
        $project = Project::where('slug', $slug)->firstOrFail();
        $project->load(['publishedBlogPosts']);

        $relatedProjects = Project::where('id', '!=', $project->id)
            ->when($project->type, fn($q) => $q->where('type', $project->type))
            ->ordered()
            ->limit(3)
            ->get()
            ->map(fn($p) => $this->transformProject($p));

        return Inertia::render('Portfolio/ProjectDetail', [
            'project' => array_merge($this->transformProject($project), [
                'excerpt' => $project->excerpt,
                'demo_url' => $project->demo_url,
                'repo_url' => $project->repo_url,
                'status' => $project->status,
                'started_at' => $project->started_at?->format('M Y'),
                'finished_at' => $project->finished_at?->format('M Y'),
                'blog_posts' => $project->publishedBlogPosts->map(fn($b) => [
                    'title' => $b->title,
                    'slug' => $b->slug,
                    'published_at' => $b->published_at->format('d M Y'),
                ]),
            ]),
            'related_projects' => $relatedProjects,
        ]);
    }

    // ✅ FIX: Fungsi yang menyebabkan error di tempatmu
    public function showExperience($slug)
    {
        $experience = Experience::where('slug', $slug)
            ->published()
            ->firstOrFail();

        return Inertia::render('Portfolio/ExperienceDetail', [
            'experience' => $this->transformExperience($experience, true),
        ]);
    }

    // Detail Blog
    public function showBlog($slug)
    {
        $blog = BlogPost::with('project:id,title,slug,thumbnail_url')
            ->where('slug', $slug)
            ->published()
            ->firstOrFail();

        return Inertia::render('Portfolio/BlogDetail', [
            'blog' => array_merge($this->transformBlog($blog), [
                'content' => $blog->content,
                'project' => $blog->project ? [
                    'title' => $blog->project->title,
                    'slug' => $blog->project->slug,
                    'image' => $blog->project->thumbnail_url,
                ] : null,
            ]),
        ]);
    }

    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'message' => 'required|string|max:2000',
        ]);

        Contact::create($validated);
        return back()->with('success', 'Pesan terkirim!');
    }

    // ==================== TRANSFORMERS (MODERN APPROACH) ====================

    private function transformProject(Project $project): array
    {
        return [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'image' => $project->thumbnail_url, // Mengambil URL Cloudinary langsung
            'technologies' => $project->technologies ?? [],
            'type' => $project->type,
        ];
    }

    private function transformCertificate(Certificate $cert): array
    {
        return [
            'id' => $cert->id,
            'title' => $cert->name,
            'issuer' => $cert->issuer,
            'image' => $cert->image_url, // Mengambil URL Cloudinary langsung
            'is_pdf' => str_ends_with(strtolower($cert->image_url), '.pdf'),
            'tags' => $cert->tags,
        ];
    }

    private function transformExperience(Experience $exp, bool $detailed = false): array
    {
        $data = [
            'id' => $exp->id,
            'slug' => $exp->slug,
            'company_name' => $exp->company_name,
            'company_logo' => $exp->company_logo, // Mengambil URL Cloudinary langsung
            'position' => $exp->position,
            'formatted_duration' => $exp->formatted_duration,
            'description' => $exp->description,
        ];

        if ($detailed) {
            $data['detailed_description'] = $exp->detailed_description;
            $data['tech_stack'] = $exp->tech_stack ?? [];
            $data['gallery'] = $exp->gallery ?? []; // Array URL Cloudinary
        }

        return $data;
    }

    private function transformBlog(BlogPost $blog): array
    {
        return [
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'published_at' => $blog->published_at->format('d M Y'),
            'image' => $blog->project?->thumbnail_url,
        ];
    }
}