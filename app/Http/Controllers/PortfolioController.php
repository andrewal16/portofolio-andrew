<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormMail;
use App\Models\BlogPost;
use App\Models\Certificate;
use App\Models\Contact;
use App\Models\Experience;
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

            'experiences' => Cache::remember('experiences:published', now()->addHours(6), function () {
                return Experience::published()
                    ->timeline()
                    ->get()
                    ->map(function ($exp) {
                        return [
                            'id' => $exp->id,
                            'slug' => $exp->slug,
                            'company_name' => $exp->company_name,
                            'company_logo' => $exp->company_logo,
                            'position' => $exp->position,
                            'employment_type' => $exp->employment_type,
                            'employment_type_label' => $exp->getEmploymentTypeLabel(),
                            'employment_type_color' => $exp->getEmploymentTypeColor(),
                            'description' => $exp->description,
                            'location' => $exp->location,
                            'is_remote' => $exp->is_remote,
                            'is_current' => $exp->is_current,
                            'formatted_duration' => $exp->formatted_duration,
                            'duration_in_months' => $exp->duration_in_months,
                            'display_date' => $exp->display_date,
                            'tech_stack' => $exp->tech_stack ?? [],
                            'metrics' => $exp->metrics ?? [],
                            'is_featured' => $exp->is_featured,
                        ];
                    });
            }),

            'certificates' => Certificate::with('tags')
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
                        'tags' => $cert->tags->map(function ($tag) {
                            return [
                                'id' => $tag->id,
                                'name' => $tag->name,
                                'color' => $tag->color ?? '#6366f1',
                            ];
                        }),
                    ];
                }),

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

            // ✅ ENHANCED: Professional bio berdasarkan CV
            'profile' => Cache::remember('profile:data', now()->addWeek(), function () {
                return [
                    'name' => 'Andrew Alfonso Lie',
                    'title' => 'Frontend Lead & Full-Stack Developer',
                    'bio' => 'Transforming complex business challenges into elegant digital solutions. As Frontend Lead at BINUS IT Division, I architect enterprise-level applications serving 10,000+ users. AI4Impact Scholar (0.26% acceptance rate) with expertise in full-stack development and emerging AI technologies.',
                    'bio_extended' => 'Results-driven Computer Science student with proven expertise in full-stack web development and emerging AI technologies. Currently serving as Frontend Lead at BINUS IT Division, architecting enterprise-level applications. Selected for prestigious AI4Impact Scholarship (7/2700 applicants - 0.26% acceptance rate). Passionate about leveraging technical leadership experience and AI knowledge to drive innovation in web development.',
                    'avatar' => 'https://ui-avatars.com/api/?name=Andrew+Lie&background=06B6D4&color=fff&size=200',
                    'stats' => [
                        ['label' => 'Years Experience', 'value' => '2+'],
                        ['label' => 'Projects Completed', 'value' => '10+'],
                        ['label' => 'Users Impacted', 'value' => '10K+'],
                        ['label' => 'GPA', 'value' => '3.79'],
                    ],
                    'social' => [
                        'github' => 'https://github.com/andrewlie',
                        'linkedin' => 'https://linkedin.com/in/andrewalfonsolie',
                        'email' => 'andrewalfonsolie16@gmail.com',
                    ],
                ];
            }),
        ];

        return Inertia::render('Portfolio/Index', $data);
    }

    /**
     * ✅ FIXED: Experience detail dengan gallery URLs yang benar
     */
    public function showExperience(string $slug): Response
    {
        $experience = Cache::remember("experience:{$slug}", now()->addHours(6), function () use ($slug) {
            return Experience::where('slug', $slug)
                ->where('is_published', true)
                ->firstOrFail();
        });

        $relatedExperiences = Cache::remember(
            "experience:{$slug}:related",
            now()->addHours(6),
            function () use ($experience) {
                return Experience::published()
                    ->where('id', '!=', $experience->id)
                    ->where(function ($query) use ($experience) {
                        $query->where('company_name', $experience->company_name);

                        if ($experience->tech_stack && count($experience->tech_stack) > 0) {
                            foreach ($experience->tech_stack as $tech) {
                                $query->orWhereJsonContains('tech_stack', $tech);
                            }
                        }
                    })
                    ->timeline()
                    ->limit(3)
                    ->get()
                    ->map(function ($exp) {
                        return [
                            'id' => $exp->id,
                            'slug' => $exp->slug,
                            'company_name' => $exp->company_name,
                            'company_logo' => $exp->company_logo ? asset('storage/'.$exp->company_logo) : null,
                            'position' => $exp->position,
                            'formatted_duration' => $exp->formatted_duration,
                            'description' => $exp->description,
                        ];
                    });
            }
        );

        // ✅ Format duration yang lebih baik
        $durationMonths = $experience->duration_in_months;
        $durationText = $durationMonths < 1
            ? '< 1 month'
            : ($durationMonths == 1
                ? '1 month'
                : number_format($durationMonths, 1).' months');

        return Inertia::render('Portfolio/ExperienceDetail', [
            'experience' => [
                'id' => $experience->id,
                'slug' => $experience->slug,
                'company_name' => $experience->company_name,
                'company_logo' => $experience->company_logo ? asset('storage/'.$experience->company_logo) : null,
                'position' => $experience->position,
                'employment_type' => $experience->employment_type,
                'employment_type_label' => $experience->getEmploymentTypeLabel(),
                'employment_type_color' => $experience->getEmploymentTypeColor(),
                'description' => $experience->description,
                'detailed_description' => $experience->detailed_description,
                'location' => $experience->location,
                'is_remote' => $experience->is_remote,
                'is_current' => $experience->is_current,
                'formatted_duration' => $experience->formatted_duration,
                'duration_in_months' => $durationMonths,
                'duration_text' => $durationText, // ✅ NEW: Human-readable duration
                'start_date' => $experience->start_date->format('M Y'),
                'end_date' => $experience->is_current ? 'Present' : $experience->end_date->format('M Y'),
                'key_achievements' => $experience->key_achievements ?? [],
                'metrics' => $experience->metrics ?? [],
                'tech_stack' => $experience->tech_stack ?? [],
                'gallery' => $experience->gallery_urls, // ✅ FIXED: Gunakan full URLs
                'is_featured' => $experience->is_featured,
            ],
            'related_experiences' => $relatedExperiences,
        ]);
    }

    public function show(string $slug): Response
    {
        $project = Project::where('slug', $slug)
            ->whereIn('status', ['ongoing', 'completed', 'upcoming'])
            ->firstOrFail();

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
        $blog = BlogPost::withProjectData()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $relatedPosts = BlogPost::withProjectData()
            ->where('project_id', $blog->project_id)
            ->where('id', '!=', $blog->id)
            ->published()
            ->latest()
            ->limit(3)
            ->get();

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
