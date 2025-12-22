import {
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CodeOutlined,
    GithubOutlined,
    GlobalOutlined,
    RocketOutlined,
    SyncOutlined,
    TagOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { Head, Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

// Register GSAP
gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetail({ project, other_projects }) {
    const containerRef = useRef(null);

    // --- Helper Warna (Sama seperti sebelumnya) ---
    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed':
                return {
                    class: 'border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]',
                    icon: <CheckCircleOutlined />,
                };
            case 'ongoing':
                return {
                    class: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
                    icon: <SyncOutlined spin />,
                };
            case 'upcoming':
                return {
                    class: 'border-orange-500/30 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.2)]',
                    icon: <ClockCircleOutlined />,
                };
            default:
                return {
                    class: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
                    icon: <TagOutlined />,
                };
        }
    };
    const statusStyle = getStatusStyle(project.status);

    // --- GSAP Animations (UPDATED FIX) ---
    useEffect(() => {
        // Hapus trigger lama jika ada untuk mencegah konflik saat navigasi inertia
        ScrollTrigger.getAll().forEach((t) => t.kill());

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // 1. Header Intro
            tl.from('.animate-back', {
                x: -20,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out',
            })
                .from(
                    '.animate-title',
                    { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' },
                    '-=0.3',
                )
                .from(
                    '.animate-meta',
                    { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 },
                    '-=0.5',
                );

            // 2. Content Reveal
            gsap.from('.animate-main-image', {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power4.out',
                delay: 0.2,
            });
            gsap.from('.animate-panel', {
                x: 30,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: 'power2.out',
                delay: 0.4,
            });

            // 3. FIX: Related Projects Animation
            // Kita cek dulu apakah elemennya ada di DOM
            if (other_projects && other_projects.length > 0) {
                // Beri jeda sedikit agar DOM render sempurna
                setTimeout(() => {
                    ScrollTrigger.refresh(); // PENTING: Recalculate posisi scroll

                    gsap.fromTo(
                        '.other-project-card',
                        { y: 50, opacity: 0 }, // State Awal
                        {
                            // State Akhir
                            y: 0,
                            opacity: 1,
                            stagger: 0.15,
                            duration: 0.8,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: '.other-projects-section',
                                start: 'top 85%', // Mulai animasi saat elemen 85% dari viewport
                                toggleActions: 'play none none reverse',
                            },
                        },
                    );
                }, 100);
            }
        }, containerRef);

        return () => ctx.revert();
    }, [project.slug]); // Re-run effect saat slug berubah

    return (
        <div
            ref={containerRef}
            className="min-h-screen overflow-x-hidden bg-[#020617] font-['Space_Grotesk'] text-slate-200 selection:bg-cyan-500 selection:text-white"
        >
            <Head title={`${project.title} | Project Detail`} />

            {/* Background FX */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="bg-grid-pattern absolute inset-0 opacity-[0.1]"></div>
                <div className="absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-900/20 blur-[120px]"></div>
            </div>

            {/* Navbar */}
            <div className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 px-6 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <Link
                        href={route('portfolio.index')}
                        className="animate-back group inline-flex items-center gap-2 font-mono text-sm text-slate-400 transition-colors hover:text-cyan-400"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10">
                            <ArrowLeftOutlined />
                        </div>
                        <span className="hidden sm:inline">RETURN_TO_BASE</span>
                    </Link>
                    <div className="animate-back flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                        <span className="font-mono text-xs tracking-widest text-slate-500 uppercase">
                            System Online
                        </span>
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 pt-12 pb-8">
                <div className="mx-auto max-w-7xl">
                    <div className="animate-meta mb-6 flex flex-wrap items-center gap-3">
                        <div
                            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase backdrop-blur-sm ${statusStyle.class}`}
                        >
                            {statusStyle.icon}
                            <span>{project.status}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-wider text-purple-400 uppercase backdrop-blur-sm">
                            <RocketOutlined />
                            <span>{project.type || 'Project'}</span>
                        </div>
                    </div>
                    <h1 className="animate-title mb-6 text-4xl leading-tight font-bold text-white md:text-6xl lg:text-7xl">
                        {project.title}
                    </h1>
                    {/* <p className="animate-title max-w-3xl text-xl leading-relaxed font-light text-slate-400">
                        {project.excerpt}
                    </p> */}
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* LEFT: Content */}
                    <div className="space-y-12 lg:col-span-2">
                        <div className="animate-main-image group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-2xl">
                            <div className="absolute top-4 left-4 z-20 h-8 w-8 border-t-2 border-l-2 border-cyan-500/50"></div>
                            <div className="absolute right-4 bottom-4 z-20 h-8 w-8 border-r-2 border-b-2 border-cyan-500/50"></div>
                            {project.image ? (
                                <div className="relative aspect-video overflow-hidden">
                                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="h-full w-full object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="flex aspect-video items-center justify-center bg-slate-900">
                                    <CodeOutlined className="text-6xl text-slate-700" />
                                </div>
                            )}
                        </div>
                        <div className="animate-main-image relative">
                            <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
                                <span className="text-cyan-500">//</span>{' '}
                                Project Overview
                            </h3>
                            <div className="prose prose-invert prose-p:text-slate-400 prose-p:leading-relaxed prose-headings:text-white max-w-none font-['Inter'] text-lg whitespace-pre-line">
                                {project.excerpt}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Sidebar */}
                    <div className="space-y-6">
                        <div className="animate-panel rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-[#020617] p-1 backdrop-blur-md">
                            <div className="space-y-4 p-5">
                                <h4 className="mb-4 border-b border-white/10 pb-2 font-mono text-xs tracking-widest text-slate-500 uppercase">
                                    Command Center
                                </h4>
                                <div className="flex flex-col gap-3">
                                    {project.demo_url ? (
                                        <a
                                            href={project.demo_url}
                                            target="_blank"
                                            className="group relative flex items-center justify-center gap-3 overflow-hidden rounded bg-cyan-600 px-6 py-4 font-bold text-white transition-all hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                                        >
                                            <div className="group-hover:animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                            <GlobalOutlined className="text-lg" />
                                            <span>INITIATE LIVE DEMO</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded border border-white/5 bg-white/5 px-6 py-4 font-mono text-sm text-slate-500"
                                        >
                                            <GlobalOutlined /> DEMO_OFFLINE
                                        </button>
                                    )}
                                    {project.repo_url && (
                                        <a
                                            href={project.repo_url}
                                            target="_blank"
                                            className="group flex items-center justify-center gap-3 rounded border border-white/10 bg-transparent px-6 py-4 font-bold text-slate-300 transition-all hover:border-white hover:bg-white/5 hover:text-white"
                                        >
                                            <GithubOutlined className="text-lg" />
                                            <span>ACCESS SOURCE</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="animate-panel rounded-xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
                            <h4 className="mb-4 border-b border-white/10 pb-2 font-mono text-xs tracking-widest text-slate-500 uppercase">
                                <ThunderboltOutlined className="mr-2" /> Tech
                                Stack
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies?.map((tech, idx) => (
                                    <span
                                        key={idx}
                                        className="rounded border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 font-mono text-xs font-semibold text-cyan-300 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/10"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="animate-panel rounded-xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
                            <h4 className="mb-4 border-b border-white/10 pb-2 font-mono text-xs tracking-widest text-slate-500 uppercase">
                                <CalendarOutlined className="mr-2" /> Temporal
                                Data
                            </h4>
                            <div className="space-y-4 font-mono text-sm">
                                <div>
                                    <div className="text-xs text-slate-500">
                                        INITIATED
                                    </div>
                                    <div className="text-white">
                                        {project.started_at || 'UNKNOWN'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">
                                        COMPLETED
                                    </div>
                                    <div className="text-white">
                                        {project.finished_at || 'PRESENT'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RELATED ARCHIVES SECTION --- */}
                {/* Kita cek apakah other_projects ada isinya */}
                {other_projects && other_projects.length > 0 ? (
                    <div className="other-projects-section mt-32 border-t border-white/10 pt-16">
                        <div className="mb-10 flex items-end justify-between">
                            <div>
                                <h3 className="text-3xl font-bold text-white">
                                    Related Archives
                                </h3>
                                <p className="mt-2 font-mono text-slate-500">
                                    EXPLORE MORE DATABASE ENTRIES
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {other_projects.map((op, idx) => (
                                <Link
                                    href={route(
                                        'portfolio.project.show',
                                        op.slug,
                                    )}
                                    key={idx}
                                    className="other-project-card group block overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 opacity-0 transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]" // Default opacity 0 untuk animasi
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <div className="absolute inset-0 z-10 bg-slate-900/20 transition-colors group-hover:bg-transparent"></div>
                                        {op.image ? (
                                            <img
                                                src={op.image}
                                                alt={op.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-800">
                                                <CodeOutlined className="text-2xl text-slate-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-white/5 bg-[#0a0f1e] p-6">
                                        <h4 className="text-lg font-bold text-white transition-colors group-hover:text-cyan-400">
                                            {op.title}
                                        </h4>
                                        <div className="mt-2 flex items-center font-mono text-xs text-slate-500 group-hover:text-slate-300">
                                            <span>ACCESS PROJECT</span>
                                            <ArrowLeftOutlined className="ml-2 rotate-180" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Optional: Debugging state jika data kosong (Hapus div ini jika sudah production)
                    <div className="mt-32 rounded-xl border border-dashed border-white/10 py-12 text-center">
                        <p className="font-mono text-sm text-slate-600">
                            NO RELATED ARCHIVES FOUND (ADD MORE PROJECTS TO DB)
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
