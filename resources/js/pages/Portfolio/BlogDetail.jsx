import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CalendarOutlined,
    CheckOutlined,
    ReadOutlined,
    ShareAltOutlined,
} from '@ant-design/icons';
import { Head, Link } from '@inertiajs/react';
import { message } from 'antd';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

export default function BlogDetail({ blog, related_posts }) {
    const containerRef = useRef(null);
    const [copied, setCopied] = useState(false);

    // =================================================================================
    // 1. SHARE PROTOCOL (Advanced Clipboard Handler)
    // =================================================================================
    const handleShare = async () => {
        const url = window.location.href;

        const showSuccess = () => {
            setCopied(true);
            message.success({
                content: 'ENCRYPTED LINK COPIED TO CLIPBOARD',
                style: { fontFamily: 'Space Grotesk', marginTop: '20vh' },
                className: 'custom-message',
            });
            setTimeout(() => setCopied(false), 2000);
        };

        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(url);
                showSuccess();
                return;
            } catch (err) {
                console.warn('Modern clipboard failed, trying legacy...', err);
            }
        }

        // Fallback for older browsers/HTTP
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showSuccess();
        } catch (err) {
            message.error('COPY FAILED. PLEASE COPY MANUALLY.');
        }
        document.body.removeChild(textArea);
    };

    // =================================================================================
    // 2. ANIMATION ORCHESTRATION (GSAP)
    // =================================================================================
    useEffect(() => {
        // Kill old triggers to prevent memory leaks during navigation
        ScrollTrigger.getAll().forEach((t) => t.kill());

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // A. Navbar & Header Entry
            tl.from('.animate-back', {
                x: -20,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out',
            })
                .from(
                    '.animate-meta',
                    {
                        opacity: 0,
                        y: 10,
                        stagger: 0.1,
                        duration: 0.6,
                    },
                    '-=0.3',
                )
                .from(
                    '.animate-title',
                    {
                        y: 30,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    },
                    '-=0.5',
                );

            // B. Project Badge (New Feature) - Muncul dengan efek pop
            if (document.querySelector('.project-badge')) {
                gsap.from('.project-badge', {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.6,
                    ease: 'back.out(1.7)',
                    delay: 0.5,
                });
            }

            // C. Main Content Entry
            gsap.from('.blog-content', {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power2.out',
                delay: 0.6,
            });

            // D. Related Posts (Staggered Grid)
            if (related_posts && related_posts.length > 0) {
                setTimeout(() => {
                    ScrollTrigger.refresh(); // Recalculate positions
                    gsap.fromTo(
                        '.related-card',
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            stagger: 0.15,
                            duration: 0.8,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: '.related-section',
                                start: 'top 85%',
                                toggleActions: 'play none none reverse',
                            },
                        },
                    );
                }, 100);
            }
        }, containerRef);

        return () => ctx.revert(); // Cleanup
    }, [blog.slug]);

    // =================================================================================
    // 3. RENDER UI
    // =================================================================================
    return (
        <div
            ref={containerRef}
            className="min-h-screen overflow-x-hidden bg-[#020617] font-['Space_Grotesk'] text-slate-200 selection:bg-pink-500 selection:text-white"
        >
            <Head title={`${blog.title} | Insights`} />

            {/* --- Background FX (Cyberpunk Atmosphere) --- */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-pink-900/10 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-[120px]"></div>
            </div>

            {/* --- Navbar --- */}
            <div className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 px-6 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <Link
                        href={route('portfolio.index') + '#insights'}
                        className="animate-back group inline-flex items-center gap-2 font-mono text-sm text-slate-400 transition-colors hover:text-pink-400"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all group-hover:border-pink-500/50 group-hover:bg-pink-500/10">
                            <ArrowLeftOutlined />
                        </div>
                        <span className="hidden sm:inline">
                            RETURN_TO_INTEL
                        </span>
                    </Link>

                    <div className="animate-back">
                        <span className="flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 font-mono text-xs tracking-widest text-pink-500 uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500"></span>
                            </span>
                            Live Protocol
                        </span>
                    </div>
                </div>
            </div>

            {/* --- Hero Header --- */}
            <header className="relative z-10 px-6 pt-16 pb-12">
                <div className="mx-auto max-w-3xl text-center">
                    {/* NEW: Project Neural Link Badge (Relasi Project) */}
                    {blog.project && (
                        <div className="project-badge mx-auto mb-10 w-full max-w-2xl">
                            <Link
                                href={blog.project.url}
                                className="group relative flex w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                            >
                                {/* 1. BACKGROUND THUMBNAIL (Parallax Effect) */}
                                <div className="absolute inset-0 z-0">
                                    {/* Overlay Gradient agar text terbaca */}
                                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#020617] via-[#020617]/90 to-transparent"></div>

                                    {/* Image Project - Jika ada, pakai ini. Jika null, pakai fallback */}
                                    <div
                                        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-60 group-hover:grayscale-0"
                                        style={{
                                            backgroundImage: `url(${blog.project.image || 'https://grainy-gradients.vercel.app/noise.svg'})`,
                                        }}
                                    ></div>
                                </div>

                                {/* 2. DECORATIVE GRID LINES (Tech Feel) */}
                                <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:24px_24px]"></div>

                                {/* 3. CONTENT */}
                                <div className="relative z-20 flex w-full items-center justify-between px-6 py-5 sm:px-8 sm:py-6">
                                    {/* Left Side: Info */}
                                    <div className="flex flex-col gap-2">
                                        {/* Label Badge */}
                                        <div className="flex items-center gap-3">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                                            </span>
                                            <span className="font-mono text-[10px] tracking-[0.2em] text-cyan-400/80 uppercase">
                                                PARENT_PROJECT // SYSTEM_LINK
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white transition-colors group-hover:text-cyan-100 sm:text-2xl">
                                            {blog.project.title}
                                        </h2>

                                        {/* Optional: Tech Stack / Meta (Hardcoded example or from props) */}
                                        <div className="mt-1 flex items-center gap-2 font-mono text-xs text-slate-500 transition-colors group-hover:text-slate-400">
                                            <span>EST. 2024</span>
                                            <span className="h-3 w-[1px] bg-slate-700"></span>
                                            <span>FULL_ACCESS_GRANTED</span>
                                        </div>
                                    </div>

                                    {/* Right Side: Action Button */}
                                    <div className="hidden h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-cyan-500 group-hover:bg-cyan-500 group-hover:text-black sm:flex">
                                        <ArrowRightOutlined className="-rotate-45 transition-transform duration-300 group-hover:rotate-0" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="animate-meta mb-6 flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-slate-400 md:text-sm">
                        <span className="flex items-center gap-2 rounded-md border border-white/5 bg-white/5 px-3 py-1">
                            <CalendarOutlined className="text-pink-500" />{' '}
                            {blog.published_at}
                        </span>
                        <span className="flex items-center gap-2 rounded-md border border-white/5 bg-white/5 px-3 py-1">
                            <ReadOutlined className="text-pink-500" />{' '}
                            {blog.read_time}
                        </span>
                    </div>

                    <h1 className="animate-title mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-4xl leading-tight font-bold text-transparent md:text-5xl lg:text-6xl">
                        {blog.title}
                    </h1>

                    <div className="animate-meta mx-auto h-[1px] w-full max-w-[100px] bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="relative z-10 px-6 pb-24">
                <div className="mx-auto max-w-3xl">
                    {/* TINYMCE CONTENT RENDERER */}
                    <article className="blog-content prose prose-lg max-w-none prose-invert marker:text-pink-500 prose-headings:font-['Space_Grotesk'] prose-headings:font-bold prose-headings:text-white prose-p:font-['Inter'] prose-p:leading-relaxed prose-p:text-slate-300 prose-a:text-pink-400 prose-a:no-underline prose-a:transition-colors hover:prose-a:text-pink-300 prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-l-pink-500 prose-blockquote:bg-white/5 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic prose-strong:text-white prose-code:rounded prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-['JetBrains_Mono'] prose-code:text-cyan-300 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-white/10 prose-pre:bg-[#0a0f1e] prose-pre:shadow-xl prose-img:rounded-xl prose-img:border prose-img:border-white/5 prose-img:shadow-2xl">
                        <div
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </article>

                    {/* FOOTER OF POST / SHARE SECTION */}
                    <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-10 md:flex-row">
                        <div className="font-mono text-sm text-slate-500">
                            TRANSMISSION_AUTHOR //{' '}
                            <span className="border-b border-pink-500/50 pb-0.5 text-white">
                                {blog.author}
                            </span>
                        </div>

                        <button
                            onClick={handleShare}
                            className={`group flex items-center gap-2 rounded-full border px-6 py-2.5 font-mono text-sm transition-all ${
                                copied
                                    ? 'border-green-500 bg-green-500/10 text-green-400'
                                    : 'border-white/10 text-slate-300 hover:border-pink-500/50 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {copied ? (
                                <CheckOutlined />
                            ) : (
                                <ShareAltOutlined className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            )}
                            {copied ? 'LINK_SECURED' : 'SHARE_DATA'}
                        </button>
                    </div>
                </div>

                {/* --- RELATED POSTS SECTION --- */}
                {related_posts && related_posts.length > 0 && (
                    <div className="related-section mx-auto mt-24 max-w-5xl border-t border-white/10 pt-16">
                        <div className="mb-8 flex items-center gap-4">
                            <span className="font-mono text-sm tracking-widest text-pink-500">
                                RELATED_ENTRIES
                            </span>
                            <div className="h-[1px] flex-grow bg-slate-800"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {related_posts.map((post, idx) => (
                                <Link
                                    href={route(
                                        'portfolio.blog.show',
                                        post.slug,
                                    )}
                                    key={`${post.slug}-${idx}`}
                                    className="related-card group relative block h-[280px] overflow-hidden rounded-xl border border-white/5 bg-slate-900/40 opacity-0 transition-all hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                                >
                                    {/* 1. BACKGROUND IMAGE */}
                                    <div className="absolute inset-0 z-0">
                                        {/* Gradient Overlay agar text terbaca */}
                                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>

                                        {post.image ? (
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-slate-800 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50"></div>
                                        )}
                                    </div>

                                    {/* 2. TEXT CONTENT */}
                                    <div className="relative z-20 flex h-full flex-col p-6">
                                        <div className="mb-3 flex items-center justify-between">
                                            {post.project_name && (
                                                <span className="rounded border border-cyan-500/20 bg-cyan-950/50 px-2 py-0.5 font-mono text-[10px] text-cyan-300 backdrop-blur-md">
                                                    {post.project_name}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <span className="mb-2 block font-mono text-xs text-slate-400 transition-colors group-hover:text-pink-400">
                                                {post.published_at}
                                            </span>
                                            <h3 className="line-clamp-2 text-lg leading-snug font-bold text-white transition-colors group-hover:text-cyan-200">
                                                {post.title}
                                            </h3>
                                        </div>

                                        {/* Hover Icon */}
                                        <div className="absolute top-6 right-6 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                            <ArrowLeftOutlined className="rotate-[135deg] text-lg text-cyan-400" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
