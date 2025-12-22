<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Certificate;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        $data = [
            // ==========================================
            // 1. PROJECTS (FIX: Gunakan paginate + through)
            // ==========================================
            // Ubah paginate(6) sesuai keinginan jumlah per load
            'projects' => Project::with(['blogPosts' => function($query) {
                    $query->latest()->limit(3);
                }])
                ->whereIn('status', ['completed', 'ongoing'])
                ->latest('started_at')
                ->paginate(6) // 👈 UBAH DARI GET() KE PAGINATE()
                ->through(function($project) { // 👈 GUNAKAN THROUGH
                    return [
                        'id' => $project->id,
                        'title' => $project->title,
                        'slug' => $project->slug,
                        'description' => $project->excerpt,
                        'image' => $project->thumbnail_full_url,
                        'technologies' => $project->technologies,
                        'demo_url' => $project->demo_url,
                        'github_url' => $project->repo_url,
                        'type' => $project->type, // Pastikan kolom ini ada
                        'created_at' => $project->created_at->format('M Y'),
                    ];
                }),

            // ==========================================
            // 2. CERTIFICATES
            // ==========================================
            'certificates' => Certificate::latest('issued_at')
                ->get()
                ->map(function($cert) {
                    return [
                        'id' => $cert->id,
                        'title' => $cert->title ?? $cert->name,
                        'issuer' => $cert->issuer,
                        'issued_date' => $cert->issued_at ? $cert->issued_at->format('M Y') : '-',
                        'image' => $cert->image_full_url,
                    ];
                }),

            // ==========================================
            // 3. BLOGS
            // ==========================================
            'recent_blogs' => BlogPost::with('project:id,title')
                ->where('is_published', true)
                ->latest()
                ->limit(3) // Tampilkan 3 blog terbaru
                ->get()
                ->map(function($blog) {
                    return [
                        'id' => $blog->id,
                        'title' => $blog->title,
                        'excerpt' => $blog->excerpt,
                        'slug' => $blog->slug,
                        'project' => $blog->project,
                        'published_at' => $blog->published_at ? $blog->published_at->diffForHumans() : '-',
                        'read_time' => ($blog->read_time ?? 5) . ' min read',
                    ];
                }),

            // ==========================================
            // 4. PROFILE
            // ==========================================
            'profile' => [
                'name' => 'Andrew Lie',
                'bio' => 'Building robust web applications with Laravel, Inertia, and React.',
                'avatar' => 'https://ui-avatars.com/api/?name=Andrew+Lie&background=0D8ABC&color=fff',
                'social' => [
                    'github' => 'https://github.com/andrewlie',
                    'linkedin' => 'https://linkedin.com/in/andrewlie',
                    'twitter' => 'https://twitter.com/andrewlie',
                ],
            ],
        ];

        return Inertia::render('Portfolio/Index', $data);
    }
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string',
        ]);

        // Logic kirim email atau simpan ke database
        // Mail::to('andrew@example.com')->send(new ContactMail($validated));

        // Simpan ke DB (contoh jika punya model Contact)
        // \App\Models\Contact::create($validated);

        return back()->with('success', 'Transmission received. I will respond shortly.');
    }

    public function show(string $slug): Response
{
    $project = \App\Models\Project::where('slug', $slug)
        ->whereIn('status', ['ongoing', 'completed', 'upcoming']) // Pastikan status sesuai
        ->firstOrFail();

    // LOGIKA PERBAIKAN:
    // Ambil project lain, tapi limit 3.
    $otherProjects = \App\Models\Project::where('id', '!=', $project->id)
        ->whereIn('status', ['ongoing', 'completed']) // Hanya tampilkan yang sudah jadi/sedang jalan
        ->latest('started_at')
        ->limit(3)
        ->get()
        ->map(function($p) {
            return [
                'title' => $p->title,
                'slug' => $p->slug,
                // Pastikan menggunakan accessor yang benar.
                // Jika thumbnail_full_url null, gunakan placeholder agar tidak crash.
                'image' => $p->thumbnail_full_url ?? 'https://via.placeholder.com/600x400?text=No+Image',
            ];
        });

    return Inertia::render('Portfolio/ProjectDetail', [
        'project' => [
            // ... (data project yang sudah ada sebelumnya) ...
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
            'started_at' => $project->started_at ? $project->started_at->format('M Y') : null,
            'finished_at' => $project->finished_at ? $project->finished_at->format('M Y') : 'Present',
            'duration' => 'Dynamic Duration', // Bisa dihitung manual
        ],
        // Kirim array kosong [] jika tidak ada, React akan menghandle-nya
        'other_projects' => $otherProjects
    ]);
}

    // App/Http/Controllers/PortfolioController.php

public function showBlog(string $slug): Response
{
    // 1. Ambil Main Blog Post dengan Project-nya
    $blog = BlogPost::with('project')
        ->where('slug', $slug)
        ->where('is_published', true)
        ->firstOrFail();

    // 2. LOGIKA RELATED: Prioritaskan post dari Project yang SAMA
    $relatedPosts = BlogPost::with('project') // <--- PENTING: Eager Load Project
        ->where('project_id', $blog->project_id)
        ->where('id', '!=', $blog->id) // Jangan tampilkan post yang sedang dibaca
        ->where('is_published', true)
        ->latest()
        ->limit(3)
        ->get();

    // 3. LOGIKA FILLER: Jika kurang dari 3, ambil dari Project LAIN
    if ($relatedPosts->count() < 3) {
        $needed = 3 - $relatedPosts->count();

        // Kumpulkan ID yang sudah ada (Current Post + Related Posts)
        $existingIds = $relatedPosts->pluck('id')->push($blog->id);

        $fillerPosts = BlogPost::with('project') // <--- FIX: Tambahkan with('project') disini juga
            ->whereNotIn('id', $existingIds)
            ->where('is_published', true)
            ->latest() // Bisa diganti inRandomOrder() jika ingin variasi
            ->limit($needed)
            ->get();

        // Gabungkan Collection
        $relatedPosts = $relatedPosts->merge($fillerPosts);
    }

    // 4. MAPPING DATA (Payload ke Inertia)
    $mappedRelated = $relatedPosts->map(fn($b) => [
        'title'        => $b->title,
        'slug'         => $b->slug,
        'published_at' => $b->published_at ? $b->published_at->format('M d, Y') : 'Draft',
        // Logic Gambar: Ambil dari Project Thumbnail, jika null pakai placeholder Web3
        'image'        => $b->project ? $b->project->thumbnail_full_url : 'https://grainy-gradients.vercel.app/noise.svg',
        // Opsional: Kirim nama project untuk label di kartu related
        'project_name' => $b->project ? $b->project->title : 'Research',
    ]);

    return Inertia::render('Portfolio/BlogDetail', [
        'blog' => [
            'id'           => $blog->id,
            'title'        => $blog->title,
            'slug'         => $blog->slug,
            'content'      => $blog->content, // TinyMCE Output
            'author'       => 'Andrew Lie',   // Hardcoded atau ambil dari user relation
            'published_at' => $blog->published_at ? $blog->published_at->format('F d, Y') : 'Draft',
            'read_time'    => ceil(str_word_count(strip_tags($blog->content)) / 200) . ' min read',
            // Data Project Induk untuk Header
            'project'      => $blog->project ? [
                'title' => $blog->project->title,
                'slug'  => $blog->project->slug,
                'image' => $blog->project->thumbnail_full_url,
                'url'   => route('portfolio.project.show', $blog->project->slug), // Pre-generate URL
            ] : null,
        ],
        'related_posts' => $mappedRelated,
    ]);
}
}
