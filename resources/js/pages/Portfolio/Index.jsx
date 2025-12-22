import {
    ArrowRightOutlined,
    CloseOutlined,
    DownloadOutlined,
    GithubOutlined,
    LinkedinOutlined,
    LoadingOutlined,
    ReadOutlined,
    SafetyCertificateOutlined,
    SendOutlined,
    ThunderboltOutlined,
    TwitterOutlined,
} from '@ant-design/icons';
import { Head, Link, useForm } from '@inertiajs/react';
import { Modal, message } from 'antd'; // Import Message Antd
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { useEffect, useRef, useState } from 'react';

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

export default function PortfolioIndex({
    profile,
    projects,
    certificates,
    recent_blogs,
}) {
    // --- State & Hooks ---
    const [isLoading, setIsLoading] = useState(true);
    const [previewCert, setPreviewCert] = useState(null);

    // Pagination Logic
    // Kita cek apakah projects.data ada (karena sekarang pakai paginate)
    const [projectList, setProjectList] = useState(projects.data || []);
    const [nextPageUrl, setNextPageUrl] = useState(projects.next_page_url);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Contact Form Hook (Inertia)
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    // --- Refs ---
    const containerRef = useRef(null);
    const cursorRef = useRef(null);
    const textRef = useRef(null);
    const marqueeRef = useRef(null);

    // --- Data Static ---
    const roles = ['Web Developer', 'Data Scientist', 'Creative Coder'];
    const techStack = [
        'Laravel',
        'React',
        'Inertia',
        'Tailwind',
        'GSAP',
        'Python',
        'MySQL',
        'AWS',
    ];
    const infiniteTech = [
        ...techStack,
        ...techStack,
        ...techStack,
        ...techStack,
    ];

    // --- ANIMATION INIT ---
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    setIsLoading(false);
                    startTypewriter();
                },
            });

            // Splash
            tl.to('.counter', {
                innerText: 100,
                duration: 1.5,
                snap: { innerText: 1 },
                ease: 'power2.out',
            })
                .to(
                    '.loader-bar',
                    { width: '100%', duration: 1.5, ease: 'power2.inOut' },
                    '<',
                )
                .to('.splash-content', { opacity: 0, y: -50, duration: 0.5 })
                .to('.splash-screen', {
                    yPercent: -100,
                    duration: 0.8,
                    ease: 'power4.inOut',
                })

                // Hero Reveal
                .from(
                    '.hero-element',
                    {
                        y: 50,
                        opacity: 0,
                        stagger: 0.1,
                        duration: 1,
                        ease: 'power3.out',
                    },
                    '-=0.3',
                )
                .from(
                    '.hero-avatar',
                    {
                        scale: 0.8,
                        opacity: 0,
                        rotation: -5,
                        duration: 1.2,
                        ease: 'back.out(1.7)',
                    },
                    '<',
                );

            // Marquee
            gsap.to(marqueeRef.current, {
                xPercent: -50,
                repeat: -1,
                duration: 25,
                ease: 'linear',
            });

            // Scroll Triggers untuk Section
            gsap.utils.toArray('.reveal-section').forEach((section) => {
                gsap.from(section, {
                    scrollTrigger: { trigger: section, start: 'top 80%' },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Typewriter Logic
    const startTypewriter = () => {
        if (!textRef.current) return;
        let masterTl = gsap.timeline({ repeat: -1 });
        roles.forEach((role) => {
            let tl = gsap.timeline({ repeat: 1, yoyo: true, repeatDelay: 1.5 });
            tl.to(textRef.current, {
                duration: role.length * 0.1,
                text: role,
                ease: 'none',
            });
            masterTl.add(tl);
        });
    };

    // Cursor Blink
    useEffect(() => {
        gsap.to(cursorRef.current, {
            opacity: 0,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true,
            duration: 0.5,
        });
    }, []);

    // --- Handlers ---
    const handleLoadMore = async () => {
        if (!nextPageUrl) return;
        setIsLoadingMore(true);
        try {
            const res = await fetch(nextPageUrl, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const json = await res.json();
                // Adaptasi struktur JSON Laravel Pagination
                const newData = json.data || json.projects?.data || [];
                const newNext =
                    json.next_page_url || json.projects?.next_page_url;

                setProjectList((prev) => [...prev, ...newData]);
                setNextPageUrl(newNext);

                // Animasi item baru
                setTimeout(() => {
                    gsap.fromTo(
                        '.project-card-new',
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, stagger: 0.1 },
                    );
                }, 100);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        // Asumsikan route 'contact.send' sudah dibuat di web.php
        post(route('contact.send'), {
            onSuccess: () => {
                reset();
                message.success('Transmission Sent Successfully!');
            },
            onError: () => {
                message.error('Transmission Failed. Check inputs.');
            },
        });
    };

    return (
        <div
            ref={containerRef}
            className="min-h-screen overflow-x-hidden bg-[#020617] font-['Space_Grotesk'] text-slate-200 selection:bg-cyan-500 selection:text-white"
        >
            <Head title={`Portfolio - ${profile.name}`} />

            {/* SPLASH SCREEN */}
            <div className="splash-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617]">
                <div className="splash-content w-full max-w-md px-6 text-center">
                    <div className="mb-2 flex justify-between">
                        <span className="font-mono text-cyan-500">
                            SYSTEM_BOOT
                        </span>
                        <span className="text-4xl font-bold text-white">
                            <span className="counter">0</span>%
                        </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                        <div className="loader-bar h-full w-0 bg-cyan-500 shadow-[0_0_15px_cyan]"></div>
                    </div>
                </div>
            </div>

            {/* BACKGROUND */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="bg-grid-pattern absolute inset-0 opacity-[0.15]"></div>
                <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-600/20 blur-[100px]"></div>
            </div>

            {/* NAVBAR */}
            <nav className="fixed z-50 flex w-full items-center justify-between border-b border-white/5 bg-[#020617]/70 px-6 py-6 backdrop-blur-md">
                <div className="text-xl font-bold tracking-widest text-white">
                    {profile.name.split(' ')[0]}
                    <span className="text-cyan-500">.DEV</span>
                </div>
                <a
                    href="#contact"
                    className="hidden rounded-full border border-cyan-500/50 px-6 py-2 font-mono text-sm text-cyan-400 transition-all hover:bg-cyan-500/10 md:block"
                >
                    INITIATE_CONTACT
                </a>
            </nav>

            {/* HERO */}
            <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-20">
                <div className="grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
                    <div className="order-2 space-y-6 lg:order-1">
                        <div className="hero-element inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 font-mono text-xs text-cyan-400">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative h-2 w-2 rounded-full bg-cyan-500"></span>
                            </span>
                            Available for Work
                        </div>
                        <h1 className="hero-element text-5xl leading-tight font-bold text-white md:text-7xl">
                            Hi, I'm <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                                {profile.name}
                            </span>
                        </h1>
                        <div className="hero-element flex h-12 items-center text-2xl font-light text-slate-400 md:text-3xl">
                            I build{' '}
                            <span className="ml-2 font-mono font-bold text-white">
                                <span ref={textRef}></span>
                                <span ref={cursorRef} className="text-cyan-500">
                                    _
                                </span>
                            </span>
                        </div>
                        <p className="hero-element max-w-lg text-lg leading-relaxed text-slate-400">
                            {profile.bio}
                        </p>
                        <div className="hero-element flex gap-4 pt-4">
                            <button
                                onClick={() =>
                                    document
                                        .getElementById('projects')
                                        .scrollIntoView({ behavior: 'smooth' })
                                }
                                className="rounded-full bg-cyan-600 px-8 py-3 font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 hover:bg-cyan-500"
                            >
                                View Projects
                            </button>
                            <a
                                href="#"
                                className="flex items-center gap-2 rounded-full border border-slate-700 px-8 py-3 text-slate-300 hover:border-white hover:text-white"
                            >
                                <DownloadOutlined /> Resume
                            </a>
                        </div>
                    </div>
                    <div className="relative order-1 flex justify-center lg:order-2 lg:justify-end">
                        <div className="hero-avatar relative h-72 w-72 md:h-96 md:w-96">
                            <div className="absolute inset-[-20px] animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-cyan-500/30"></div>
                            <div className="group relative h-full w-full overflow-hidden rounded-full border-4 border-slate-900/50 shadow-2xl">
                                <img
                                    src={profile.avatar}
                                    alt="Avatar"
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TECH MARQUEE */}
            <section className="relative z-10 overflow-hidden border-y border-white/5 bg-[#020617]/50 py-8 backdrop-blur-sm">
                <div className="flex whitespace-nowrap" ref={marqueeRef}>
                    {infiniteTech.map((t, i) => (
                        <div
                            key={i}
                            className="mx-8 flex items-center font-mono text-xl font-bold tracking-widest text-slate-500 uppercase opacity-70 transition-opacity hover:text-white hover:opacity-100"
                        >
                            <ThunderboltOutlined className="mr-2 text-cyan-500" />
                            {t}
                        </div>
                    ))}
                </div>
            </section>

            {/* PROJECTS SECTION */}
            <section id="projects" className="relative z-10 px-6 py-32">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal-section mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
                        <div>
                            <span className="mb-2 block font-mono text-sm tracking-widest text-cyan-500">
                                01 // PORTFOLIO
                            </span>
                            <h2 className="text-5xl font-bold text-white">
                                Selected Works
                            </h2>
                        </div>
                        <div className="h-[1px] flex-grow bg-slate-800 md:mx-8"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {projectList.map((project, idx) => (
                            <Link
                                href={route(
                                    'portfolio.project.show',
                                    project.slug,
                                )}
                                key={`${project.id}-${idx}`}
                                className={`project-card ${idx >= (projects.data?.length || 0) ? 'project-card-new' : ''} reveal-section group relative block flex h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]`}
                            >
                                <div className="relative h-[55%] overflow-hidden">
                                    <div className="absolute inset-0 z-10 bg-slate-900/20 transition-colors group-hover:bg-slate-900/0"></div>
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                    />
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-xs text-cyan-400 backdrop-blur-md">
                                            {project.type || 'Web App'}
                                        </span>
                                    </div>
                                </div>
                                <div className="relative z-20 flex h-[45%] flex-col bg-gradient-to-b from-[#0f172a] to-[#020617] p-6">
                                    <div className="mb-2 flex items-start justify-between">
                                        <h3 className="text-xl font-bold text-white transition-colors group-hover:text-cyan-400">
                                            {project.title}
                                        </h3>
                                        <ArrowRightOutlined className="-translate-x-4 text-slate-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                                    </div>
                                    <p className="mb-4 line-clamp-2 font-['Inter'] text-sm text-slate-400">
                                        {project.description}
                                    </p>
                                    <div className="mt-auto flex flex-wrap gap-2">
                                        {project.technologies
                                            ?.slice(0, 3)
                                            .map((t, i) => (
                                                <span
                                                    key={i}
                                                    className="rounded bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-500 uppercase"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="reveal-section mt-16 text-center">
                        {nextPageUrl && (
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="group relative inline-flex items-center gap-3 border border-cyan-500/30 px-8 py-3 font-mono text-sm tracking-widest text-cyan-400 uppercase transition-all hover:bg-cyan-500/10 disabled:opacity-50"
                            >
                                {isLoadingMore ? (
                                    <LoadingOutlined className="animate-spin" />
                                ) : (
                                    <span>Load More Protocols</span>
                                )}
                                <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-cyan-500"></span>
                                <span className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-cyan-500"></span>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* CERTIFICATES */}
            <section className="relative z-10 border-y border-white/5 bg-[#0a0f1e] py-32">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Header Section */}
                    <div className="reveal-section mb-12 flex items-center gap-4">
                        <span className="font-mono text-sm tracking-widest text-indigo-500">
                            02 // CREDENTIALS
                        </span>
                        <div className="h-[1px] flex-grow bg-slate-800"></div>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((cert) => (
                            <div
                                key={cert.id}
                                onClick={() => setPreviewCert(cert)}
                                className="reveal-section group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]"
                            >
                                {/* 1. LOGIC IMAGE BACKGROUND (Prioritas: cert.image -> Fallback) */}
                                <div className="absolute inset-0 h-full w-full bg-slate-950">
                                    {cert.image ? (
                                        <img
                                            src={cert.image}
                                            alt={cert.title}
                                            className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                                        />
                                    ) : (
                                        // Fallback jika tidak ada gambar (Pattern Noise)
                                        <div className="h-full w-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    )}

                                    {/* Gradient Overlay: Agar teks terbaca di atas gambar */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent transition-opacity duration-300 group-hover:via-[#020617]/60"></div>
                                </div>

                                {/* 2. CONTENT INFO (Overlay di atas gambar) */}
                                <div className="absolute bottom-0 left-0 z-20 w-full p-6">
                                    <div className="mb-3 flex items-center justify-between">
                                        {/* Badge Verified */}
                                        <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 backdrop-blur-md">
                                            <SafetyCertificateOutlined className="text-xs text-indigo-400" />
                                            <span className="font-mono text-[10px] tracking-wider text-indigo-300">
                                                VERIFIED_ASSET
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="mb-1 line-clamp-2 text-lg font-bold text-white transition-colors group-hover:text-indigo-200">
                                        {cert.title}
                                    </h4>

                                    <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                                        <p className="font-mono text-xs text-slate-400 uppercase transition-colors group-hover:text-white">
                                            {cert.issuer}
                                        </p>
                                        <span className="font-mono text-[10px] text-slate-600 group-hover:text-indigo-400">
                                            {cert.issued_date}
                                        </span>
                                    </div>
                                </div>

                                {/* 3. HOVER INTERACTION ICON (Eye Icon) */}
                                <div className="absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 scale-50 transform opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-sm">
                                        <ReadOutlined className="text-2xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BLOGS SECTION (RESTORED) */}
            <section id="insights" className="relative z-10 px-6 py-32">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal-section mb-16 flex items-end justify-between gap-4">
                        <div>
                            <span className="mb-2 block font-mono text-sm tracking-widest text-pink-500">
                                03 // KNOWLEDGE BASE
                            </span>
                            <h2 className="text-5xl font-bold text-white">
                                Latest Insights
                            </h2>
                        </div>
                        <div className="h-[1px] flex-grow bg-slate-800 md:mx-8"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {recent_blogs.map((blog) => (
                            <Link
                                href={`/portfolio/blog/${blog.slug}`}
                                key={blog.id}
                                className="reveal-section group relative block h-full overflow-hidden rounded-xl border border-white/5 bg-slate-900/20 transition-all duration-300 hover:border-pink-500/30 hover:bg-slate-900/40"
                            >
                                <div className="flex h-full flex-col p-8">
                                    <div className="mb-6 flex items-center justify-between font-mono text-xs">
                                        <span className="text-pink-500">
                                            {blog.published_at}
                                        </span>
                                        <span className="flex items-center gap-1 text-slate-500">
                                            <ReadOutlined /> {blog.read_time}
                                        </span>
                                    </div>
                                    <h3 className="mb-4 text-2xl leading-tight font-bold text-white transition-colors group-hover:text-pink-400">
                                        {blog.title}
                                    </h3>
                                    <p className="mb-6 line-clamp-3 font-['Inter'] text-sm text-slate-400">
                                        {blog.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center text-sm font-bold text-white">
                                        <span className="border-b border-transparent transition-all group-hover:border-pink-500">
                                            READ ARTICLE
                                        </span>
                                        <ArrowRightOutlined className="ml-2 transform text-pink-500 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION (FORM ADDED) */}
            <section
                id="contact"
                className="relative z-10 border-t border-white/5 bg-[#020617] px-6 py-24"
            >
                <div className="mx-auto max-w-4xl">
                    <div className="reveal-section mb-16 text-center">
                        <span className="font-mono text-sm tracking-widest text-cyan-500">
                            04 // TRANSMISSION
                        </span>
                        <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl">
                            Initialize Connection
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-slate-400">
                            Have a project in mind? Send encrypted data directly
                            to my terminal.
                        </p>
                    </div>

                    <form
                        onSubmit={handleContactSubmit}
                        className="reveal-section space-y-8 rounded-2xl border border-white/5 bg-slate-900/30 p-8 backdrop-blur-sm md:p-12"
                    >
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="group">
                                <label className="mb-2 ml-1 block font-mono text-xs text-cyan-500">
                                    IDENTIFIER // NAME
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full border-b border-white/20 bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none"
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <div className="mt-1 text-xs text-red-500">
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                            <div className="group">
                                <label className="mb-2 ml-1 block font-mono text-xs text-cyan-500">
                                    FREQUENCY // PHONE
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="w-full border-b border-white/20 bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none"
                                    placeholder="+62..."
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="mb-2 ml-1 block font-mono text-xs text-cyan-500">
                                DIGITAL ADDRESS // EMAIL
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="w-full border-b border-white/20 bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none"
                                placeholder="john@example.com"
                            />
                            {errors.email && (
                                <div className="mt-1 text-xs text-red-500">
                                    {errors.email}
                                </div>
                            )}
                        </div>
                        <div className="group">
                            <label className="mb-2 ml-1 block font-mono text-xs text-cyan-500">
                                PAYLOAD // MESSAGE
                            </label>
                            <textarea
                                rows="4"
                                value={data.message}
                                onChange={(e) =>
                                    setData('message', e.target.value)
                                }
                                className="w-full border-b border-white/20 bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none"
                                placeholder="Describe your project parameters..."
                            />
                            {errors.message && (
                                <div className="mt-1 text-xs text-red-500">
                                    {errors.message}
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative inline-flex items-center gap-3 rounded-sm bg-cyan-600 px-10 py-4 font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-500 disabled:opacity-50"
                            >
                                {processing ? (
                                    <LoadingOutlined className="animate-spin" />
                                ) : (
                                    <SendOutlined />
                                )}
                                <span>TRANSMIT DATA</span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/5 bg-[#020617] py-12 text-center">
                <div className="mb-8 flex justify-center gap-6">
                    {[
                        <GithubOutlined />,
                        <LinkedinOutlined />,
                        <TwitterOutlined />,
                    ].map((icon, i) => (
                        <a
                            key={i}
                            href="#"
                            className="text-2xl text-slate-500 transition-colors hover:text-cyan-400"
                        >
                            {icon}
                        </a>
                    ))}
                </div>
                <div className="font-mono text-xs text-slate-600">
                    &copy; {new Date().getFullYear()} {profile.name} // SYSTEM
                    SECURE
                </div>
            </footer>

            {/* MODAL */}
            <Modal
                open={!!previewCert}
                onCancel={() => setPreviewCert(null)}
                footer={null}
                centered
                width={900}
                closeIcon={<CloseOutlined className="text-white" />}
                styles={{
                    content: {
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        color: 'white',
                        padding: 0,
                    },
                    mask: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(2,6,23,0.8)',
                    },
                }}
            >
                {previewCert && (
                    <div className="p-6">
                        <h3 className="mb-4 text-xl font-bold text-white">
                            {previewCert.title}
                        </h3>
                        <div className="rounded-lg border border-white/10 bg-black/50 p-2">
                            <img
                                src={previewCert.image}
                                className="h-auto max-h-[70vh] w-full object-contain"
                                alt="Cert"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
