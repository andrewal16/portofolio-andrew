<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormMail;
use App\Models\BlogPost;
use App\Models\Certificate;
use App\Models\Contact;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        $data = [
            // ==========================================
            // 1. PROJECTS (✅ OPTIMIZED: Hapus unused eager loading)
            // ==========================================
            'projects' => Project::whereIn('status', ['completed', 'ongoing'])
                ->latest('started_at')
                ->paginate(6)
                ->through(function ($project) {
                    return [
                        'id' => $project->id,
                        'title' => $project->title,
                        'slug' => $project->slug,
                        'description' => $project->excerpt,
                        'image' => $project->thumbnail_full_url,
                        'technologies' => $project->technologies,
                        'demo_url' => $project->demo_url,
                        'github_url' => $project->repo_url,
                        'type' => $project->type,
                        'created_at' => $project->created_at->format('M Y'),
                    ];
                }),

            // ==========================================
            // 2. CERTIFICATES (✅ OPTIMIZED: Pakai Cache 24 jam)
            // ==========================================
            'certificates' => Certificate::with('tags') // Tetap pakai Eager Loading
                ->latest('issued_at')
                ->get()
                ->map(function ($cert) {
                    return [
                        'id' => $cert->id,
                        'title' => $cert->title ?? $cert->name,
                        'issuer' => $cert->issuer,
                        'issued_date' => $cert->issued_at?->format('M Y') ?? '-',
                        'image' => $cert->image_full_url,
                        'credential_id' => $cert->credential_id,
                        'credential_url' => $cert->credential_url,

                        // Mapping Tags
                        'tags' => $cert->tags->map(function ($tag) {
                            return [
                                'id' => $tag->id,
                                'name' => $tag->name,
                                'color' => $tag->color ?? '#6366f1',
                            ];
                        }),
                    ];
                }),

            // ==========================================
            // 3. BLOGS (✅ OPTIMIZED: Pakai scope)
            // ==========================================
            'recent_blogs' => BlogPost::withProjectData()
                ->published()
                ->latest()
                ->limit(3)
                ->get()
                ->map(function ($blog) {
                    return [
                        'id' => $blog->id,
                        'title' => $blog->title,
                        'excerpt' => $blog->excerpt,
                        'slug' => $blog->slug,
                        'project' => $blog->project,
                        'published_at' => $blog->published_at?->diffForHumans() ?? '-',
                        'read_time' => ($blog->read_time ?? 5).' min read',
                    ];
                }),

            // ==========================================
            // 4. PROFILE (✅ OPTIMIZED: Cache 7 hari)
            // ==========================================
            'profile' => Cache::remember('profile:data', now()->addWeek(), function () {
                return [
                    'name' => 'Andrew Lie',
                    'bio' => 'Building robust web applications with Laravel, Inertia, and React.',
                    'avatar' => 'https://ui-avatars.com/api/?name=Andrew+Lie&background=0D8ABC&color=fff',
                    'social' => [
                        'github' => 'https://github.com/andrewlie',
                        'linkedin' => 'https://linkedin.com/in/andrewlie',
                        'twitter' => 'https://twitter.com/andrewlie',
                    ],
                ];
            }),
        ];

        return Inertia::render('Portfolio/Index', $data);
    }

    public function show(string $slug): Response
    {
        $project = Project::where('slug', $slug)
            ->whereIn('status', ['ongoing', 'completed', 'upcoming'])
            ->firstOrFail();

        // ✅ OPTIMIZED: Select hanya kolom yang dibutuhkan
        $otherProjects = Project::select(['id', 'title', 'slug', 'thumbnail_url', 'started_at'])
            ->where('id', '!=', $project->id)
            ->whereIn('status', ['ongoing', 'completed'])
            ->latest('started_at')
            ->limit(3)
            ->get()
            ->map(function ($p) {
                return [
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'image' => $p->thumbnail_full_url ?? 'https://via.placeholder.com/600x400?text=No+Image',
                ];
            });

        return Inertia::render('Portfolio/ProjectDetail', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'excerpt' => $project->excerpt,
                'description' => $project->description,
                'image' => $project->thumbnail_full_url,
                'technologies' => $project->technologies,
                'demo_url' => $project->demo_url,
                'repo_url' => $project->repo_url,
                'status' => $project->status,
                'type' => $project->type,
                'started_at' => $project->started_at?->format('M Y'),
                'finished_at' => $project->finished_at?->format('M Y') ?? 'Present',
                'duration' => $project->duration_days ? "{$project->duration_days} days" : 'Ongoing',
            ],
            'other_projects' => $otherProjects,
        ]);
    }

    public function showBlog(string $slug): Response
    {
        // ✅ OPTIMIZED: Pakai scope withProjectData()
        $blog = BlogPost::withProjectData()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        // ✅ OPTIMIZED: Gunakan query builder yang lebih efisien
        $relatedPosts = BlogPost::withProjectData()
            ->where('project_id', $blog->project_id)
            ->where('id', '!=', $blog->id)
            ->published()
            ->latest()
            ->limit(3)
            ->get();

        // ✅ OPTIMIZED: Filler logic lebih clean
        if ($relatedPosts->count() < 3) {
            $needed = 3 - $relatedPosts->count();
            $existingIds = $relatedPosts->pluck('id')->push($blog->id);

            $fillerPosts = BlogPost::withProjectData()
                ->whereNotIn('id', $existingIds)
                ->published()
                ->latest()
                ->limit($needed)
                ->get();

            $relatedPosts = $relatedPosts->merge($fillerPosts);
        }

        // ✅ OPTIMIZED: Mapping lebih efisien
        $mappedRelated = $relatedPosts->map(function ($b) {
            return [
                'title' => $b->title,
                'slug' => $b->slug,
                'published_at' => $b->published_at?->format('M d, Y') ?? 'Draft',
                'image' => $b->project?->thumbnail_full_url ?? 'https://grainy-gradients.vercel.app/noise.svg',
                'project_name' => $b->project?->title ?? 'Research',
            ];
        });

        return Inertia::render('Portfolio/BlogDetail', [
            'blog' => [
                'id' => $blog->id,
                'title' => $blog->title,
                'slug' => $blog->slug,
                'content' => $blog->content,
                'author' => 'Andrew Lie',
                'published_at' => $blog->published_at?->format('F d, Y') ?? 'Draft',
                'read_time' => ceil(str_word_count(strip_tags($blog->content)) / 200).' min read',
                'project' => $blog->project ? [
                    'title' => $blog->project->title,
                    'slug' => $blog->project->slug,
                    'image' => $blog->project->thumbnail_full_url,
                    'url' => route('portfolio.project.show', $blog->project->slug),
                ] : null,
            ],
            'related_posts' => $mappedRelated,
        ]);
    }

    public function sendMessage(Request $request)
    {
        $key = 'contact-form:'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);

            return back()->withErrors([
                'rate_limit' => "Too many attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|min:2',
            'email' => 'required|email:rfc,dns|max:255',
            'phone' => 'nullable|string|max:20|regex:/^[\d\s\+\-\(\)]+$/',
            'message' => 'required|string|min:10|max:2000',
        ], [
            'name.required' => 'Identifier name is required.',
            'name.min' => 'Name must be at least 2 characters.',
            'email.required' => 'Digital address (email) is required.',
            'email.email' => 'Please provide a valid email address.',
            'phone.regex' => 'Invalid phone number format.',
            'message.required' => 'Message payload cannot be empty.',
            'message.min' => 'Message must be at least 10 characters.',
            'message.max' => 'Message cannot exceed 2000 characters.',
        ]);

        try {
            $contactData = array_merge($validated, [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $contact = Contact::create($contactData);
            Mail::to(config('mail.from.address'))->send(new ContactFormMail($contactData));
            RateLimiter::hit($key, 3600);

            Log::info('Contact form submitted successfully', [
                'contact_id' => $contact->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            return back()->with('success', '✅ Transmission received successfully! I will respond within 24-48 hours.');

        } catch (\Exception $e) {
            Log::error('Contact form submission failed', [
                'error' => $e->getMessage(),
                'email' => $validated['email'] ?? 'unknown',
            ]);

            return back()->withErrors([
                'system' => 'System error occurred. Please try again or contact me directly at andrewalfonsolie1@gmail.com',
            ])->withInput();
        }
    }
}
