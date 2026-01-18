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
        // ✅ Projects with pagination (initial load)
        $projects = Project::query()
            ->ordered()
            ->paginate(6)
            ->through(fn($p) => $this->transformProject($p));

        // ✅ Get unique project types for tab filter
        $projectTypes = Project::whereNotNull('type')
            ->where('type', '!=', '')
            ->distinct()
            ->pluck('type')
            ->toArray();

        // ✅ Certificates with pagination (initial load)
        $certificates = Certificate::with('tags')
            ->ordered()
            ->paginate(6)
            ->through(fn($c) => $this->transformCertificate($c));

        // Recent Blogs
        $recentBlogs = BlogPost::with('project:id,title,slug,thumbnail_url')
            ->published()
            ->latestPublished()
            ->limit(3)
            ->get()
            ->map(fn($b) => $this->transformBlog($b));

        // Experiences
        $experiences = Experience::published()
            ->timeline()
            ->get()
            ->map(fn($e) => $this->transformExperience($e));

        // Profile data
        $profile = $this->getProfileData();

        return Inertia::render('Portfolio/Index', [
            'profile' => $profile,
            'projects' => $projects,
            'projectTypes' => $projectTypes,
            'certificates' => $certificates,
            'recent_blogs' => $recentBlogs,
            'experiences' => $experiences,
        ]);
    }

    // ✅ NEW: API endpoint for AJAX project loading
    public function getProjects(Request $request)
    {
        $query = Project::query()->ordered();

        // Filter by type
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $projects = $query->paginate($request->get('per_page', 6))
            ->through(fn($p) => $this->transformProject($p));

        return response()->json($projects);
    }

    // ✅ NEW: API endpoint for AJAX certificate loading
    public function getCertificates(Request $request)
    {
        $query = Certificate::with('tags')->ordered();

        // Filter by category
        if ($request->filled('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        $certificates = $query->paginate($request->get('per_page', 6))
            ->through(fn($c) => $this->transformCertificate($c));

        return response()->json($certificates);
    }

    public function show($slug)
    {
        $project = Project::where('slug', $slug)->firstOrFail();
        $project->load(['publishedBlogPosts']);

        // Related projects (same type)
        $relatedProjects = Project::where('id', '!=', $project->id)
            ->when($project->type, fn($q) => $q->where('type', $project->type))
            ->ordered()
            ->limit(3)
            ->get()
            ->map(fn($p) => $this->transformProject($p));

        return Inertia::render('Portfolio/ProjectDetail', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'excerpt' => $project->excerpt,
                'image' => $project->thumbnail_full_url,
                'technologies' => $project->technologies ?? [],
                'demo_url' => $project->demo_url,
                'repo_url' => $project->repo_url,
                'type' => $project->type,
                'status' => $project->status,
                'started_at' => $project->started_at?->format('M Y'),
                'finished_at' => $project->finished_at?->format('M Y'),
                'blog_posts' => $project->publishedBlogPosts->map(fn($b) => [
                    'id' => $b->id,
                    'title' => $b->title,
                    'slug' => $b->slug,
                    'excerpt' => Str::limit(strip_tags($b->content), 150),
                    'published_at' => $b->published_at->format('d M Y'),
                    'read_time' => $b->read_time . ' min read',
                ]),
            ],
            'related_projects' => $relatedProjects,
        ]);
    }

    public function showExperience($slug)
    {
        $experience = Experience::where('slug', $slug)
            ->published()
            ->firstOrFail();

        return Inertia::render('Portfolio/ExperienceDetail', [
            'experience' => $this->transformExperience($experience, true),
        ]);
    }

    public function showBlog($slug)
    {
        $blog = BlogPost::with('project:id,title,slug,thumbnail_url')
            ->where('slug', $slug)
            ->published()
            ->firstOrFail();

        // Related posts
        $relatedPosts = BlogPost::with('project:id,title,slug,thumbnail_url')
            ->published()
            ->where('id', '!=', $blog->id)
            ->when($blog->project_id, fn($q) => $q->where('project_id', $blog->project_id))
            ->latestPublished()
            ->limit(3)
            ->get()
            ->map(fn($b) => $this->transformBlog($b));

        return Inertia::render('Portfolio/BlogDetail', [
            'blog' => [
                'id' => $blog->id,
                'title' => $blog->title,
                'slug' => $blog->slug,
                'content' => $blog->content,
                'excerpt' => $blog->excerpt,
                'published_at' => $blog->published_at->format('d M Y'),
                'read_time' => $blog->read_time . ' min read',
                'author' => 'Admin',
                'project' => $blog->project ? [
                    'title' => $blog->project->title,
                    'slug' => $blog->project->slug,
                    'url' => route('portfolio.project.show', $blog->project->slug),
                    'image' => $blog->project->thumbnail_full_url,
                ] : null,
            ],
            'related_posts' => $relatedPosts,
        ]);
    }

    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string|max:2000',
        ]);

        Contact::create([
            ...$validated,
            'status' => 'unread',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Pesan berhasil dikirim! Saya akan segera merespons.');
    }

    // ==================== TRANSFORM HELPERS ====================

    private function transformProject(Project $project): array
    {
        return [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'description' => $project->excerpt,
            'image' => $project->thumbnail_full_url,
            'technologies' => $project->technologies ?? [],
            'type' => $project->type,
            'status' => $project->status,
            'demo_url' => $project->demo_url,
            'repo_url' => $project->repo_url,
        ];
    }

    private function transformCertificate(Certificate $cert): array
    {
        $isPdf = $cert->image_url && str_ends_with(strtolower($cert->image_url), '.pdf');
        
        return [
            'id' => $cert->id,
            'title' => $cert->name,
            'issuer' => $cert->issuer,
            'issued_date' => $cert->issued_at->format('M Y'),
            'issued_year' => $cert->issued_year,
            'credential_id' => $cert->credential_id,
            'credential_url' => $cert->credential_url,
            'image' => $cert->image_full_url,
            'is_pdf' => $isPdf,
            'category' => $cert->category,
            'category_label' => $cert->category_label,
            'tags' => $cert->tags->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'color' => $t->color,
            ]),
        ];
    }

    private function transformBlog(BlogPost $blog): array
    {
        return [
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'excerpt' => $blog->excerpt ?? Str::limit(strip_tags($blog->content), 150),
            'published_at' => $blog->published_at->format('d M Y'),
            'read_time' => $blog->read_time . ' min read',
            'image' => $blog->project?->thumbnail_full_url,
            'project_name' => $blog->project?->title,
        ];
    }

    private function transformExperience(Experience $exp, bool $detailed = false): array
    {
        $data = [
            'id' => $exp->id,
            'slug' => $exp->slug,
            'company_name' => $exp->company_name,
            'company_logo' => $exp->company_logo ? asset('storage/' . $exp->company_logo) : null,
            'position' => $exp->position,
            'employment_type' => $exp->employment_type,
            'employment_type_label' => $exp->getEmploymentTypeLabel(),
            'employment_type_color' => $exp->getEmploymentTypeColor(),
            'location' => $exp->location,
            'is_remote' => $exp->is_remote,
            'description' => $exp->description,
            'formatted_duration' => $exp->formatted_duration,
            'duration_in_months' => $exp->duration_in_months,
            'is_current' => $exp->is_current,
            'is_featured' => $exp->is_featured,
            'display_date' => $exp->display_date,
            'tech_stack' => $exp->tech_stack ?? [],
        ];

        if ($detailed) {
            $data['detailed_description'] = $exp->detailed_description;
            $data['key_achievements'] = $exp->key_achievements ?? [];
            $data['metrics'] = $exp->metrics ?? [];
            $data['gallery'] = $exp->gallery_urls;
            $data['start_date'] = $exp->start_date->format('M Y');
            $data['end_date'] = $exp->end_date?->format('M Y');
        }

        return $data;
    }

    private function getProfileData(): array
    {
        return [
            'name' => config('portfolio.name', 'Your Name'),
            'title' => config('portfolio.title', 'Full-Stack Developer'),
            'bio' => config('portfolio.bio', 'Passionate developer building amazing digital experiences.'),
            'bio_extended' => config('portfolio.bio_extended'),
            'avatar' => config('portfolio.avatar', '/images/avatar.jpg'),
            'social' => [
                'github' => config('portfolio.social.github'),
                'linkedin' => config('portfolio.social.linkedin'),
                'twitter' => config('portfolio.social.twitter'),
            ],
            'stats' => config('portfolio.stats'),
        ];
    }
}