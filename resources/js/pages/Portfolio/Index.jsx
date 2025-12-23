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
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Modal, message } from 'antd';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { useEffect, useRef, useState } from 'react';
import { BackgroundGradientAnimation } from '../../../../components/ui/background-gradient-animation';

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

export default function PortfolioIndex({
    profile,
    projects,
    certificates,
    recent_blogs,
}) {
    // --- GET FLASH MESSAGES FROM INERTIA ---
    const { flash } = usePage().props;

    // --- State & Hooks ---
    const [isLoading, setIsLoading] = useState(true);
    const [previewCert, setPreviewCert] = useState(null);

    // Pagination Logic
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
    const contactSectionRef = useRef(null);

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

    // --- AUTO SCROLL TO CONTACT AFTER SUCCESS ---
    useEffect(() => {
        if (flash?.success && contactSectionRef.current) {
            setTimeout(() => {
                contactSectionRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 300);
        }
    }, [flash?.success]);

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
                const newData = json.data || json.projects?.data || [];
                const newNext =
                    json.next_page_url || json.projects?.next_page_url;

                setProjectList((prev) => [...prev, ...newData]);
                setNextPageUrl(newNext);

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
            message.error('Failed to load more projects');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleContactSubmit = () => {
        post(route('contact.send'), {
            onSuccess: () => {
                reset();
                message.success('Message sent successfully!');
            },
            onError: () => {
                message.error('Please check your inputs and try again.');
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
                        <span className="font-mono text-cyan-500">Loading</span>
                        <span className="text-4xl font-bold text-white">
                            <span className="counter">0</span>%
                        </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                        <div className="loader-bar h-full w-0 bg-cyan-500 shadow-[0_0_15px_cyan]"></div>
                    </div>
                </div>
            </div>

            {/* ANIMATED BACKGROUND */}
            <BackgroundGradientAnimation
                gradientBackgroundStart="rgb(2, 6, 23)"
                gradientBackgroundEnd="rgb(15, 23, 42)"
                firstColor="6, 182, 212"
                secondColor="99, 102, 241"
                thirdColor="168, 85, 247"
                fourthColor="59, 130, 246"
                fifthColor="236, 72, 153"
                pointerColor="6, 182, 212"
                size="80%"
                blendingValue="hard-light"
                interactive={true}
                containerClassName="fixed inset-0 z-0"
            />

            {/* Overlay Layers */}
            <div className="pointer-events-none fixed inset-0 z-[1]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="bg-grid-pattern absolute inset-0 opacity-[0.15]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.4)_100%)]"></div>
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
                    Contact
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
                                Andrew Alfonso Lie
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
                            <span className="mb-4 block font-mono text-2xl font-bold tracking-widest text-cyan-500">
                                01 / Portfolio
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
                                    <span>Load More Projects</span>
                                )}
                                <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-cyan-500"></span>
                                <span className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-cyan-500"></span>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* CERTIFICATES */}
            <section className="relative z-10 border-y border-white/5 bg-[#0a0f1e]/80 py-32 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="reveal-section mb-12 flex items-center gap-4">
                        <span className="block font-mono text-2xl font-bold tracking-widest text-indigo-500">
                            02 / Certifications
                        </span>
                        <div className="h-[1px] flex-grow bg-slate-800"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((cert) => (
                            <div
                                key={cert.id}
                                onClick={() => setPreviewCert(cert)}
                                className="reveal-section group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]"
                            >
                                <div className="absolute inset-0 h-full w-full bg-slate-950">
                                    {cert.image ? (
                                        <img
                                            src={cert.image}
                                            alt={cert.title}
                                            className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent transition-opacity duration-300 group-hover:via-[#020617]/60"></div>
                                </div>

                                <div className="absolute bottom-0 left-0 z-20 w-full p-6">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 backdrop-blur-md">
                                            <SafetyCertificateOutlined className="text-xs text-indigo-400" />
                                            <span className="font-mono text-[10px] tracking-wider text-indigo-300">
                                                VERIFIED
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

                                    {cert.credential_id && (
                                        <div className="mt-2 flex items-center gap-1 rounded border border-white/5 bg-black/30 px-2 py-1.5 backdrop-blur-sm">
                                            <span className="font-mono text-[9px] text-slate-500">
                                                ID:
                                            </span>
                                            <span className="font-mono text-[10px] font-semibold text-indigo-400">
                                                {cert.credential_id}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewCert(cert);
                                            }}
                                            className="flex flex-1 items-center justify-center gap-2 rounded border border-indigo-500/30 bg-indigo-500/5 px-3 py-2 font-mono text-xs text-indigo-300 backdrop-blur-sm transition-all hover:bg-indigo-500/20 hover:text-white"
                                        >
                                            <ReadOutlined />
                                            <span>View</span>
                                        </button>

                                        {cert.credential_url && (
                                            <a
                                                href={cert.credential_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="flex flex-1 items-center justify-center gap-2 rounded border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 font-mono text-xs text-cyan-300 backdrop-blur-sm transition-all hover:bg-cyan-500/20 hover:text-white"
                                            >
                                                <SafetyCertificateOutlined />
                                                <span>Verify</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BLOGS SECTION */}
            <section id="insights" className="relative z-10 px-6 py-32">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal-section mb-16 flex items-end justify-between gap-4">
                        <div>
                            <span className="mb-2 block font-mono text-2xl font-bold tracking-widest text-pink-500">
                                03 / Blog
                            </span>
                            <h2 className="text-5xl font-bold text-white">
                                Recent Articles
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
                                            Read Article
                                        </span>
                                        <ArrowRightOutlined className="ml-2 transform text-pink-500 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section
                id="contact"
                ref={contactSectionRef}
                className="relative z-10 border-t border-white/5 bg-[#020617]/80 px-6 py-24 backdrop-blur-sm"
            >
                <div className="mx-auto max-w-4xl">
                    <div className="reveal-section mb-16 text-center">
                        <span className="font-mono text-sm tracking-widest text-cyan-500">
                            04 / Contact
                        </span>
                        <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl">
                            Let's Work Together
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-slate-400">
                            Have a project in mind? Drop me a message and let's
                            discuss how we can collaborate.
                        </p>
                    </div>

                    <div className="reveal-section space-y-8 rounded-2xl border border-white/5 bg-slate-900/30 p-8 backdrop-blur-sm md:p-12">
                        {/* SUCCESS MESSAGE */}
                        {flash?.success && (
                            <div className="animate-fadeIn rounded-lg border border-green-500/30 bg-green-500/10 p-6 backdrop-blur-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="mb-1 font-bold text-green-400">
                                            Message Sent Successfully
                                        </p>
                                        <p className="font-mono text-sm leading-relaxed text-green-300">
                                            {flash.success}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ERROR MESSAGES */}
                        {Object.keys(errors).length > 0 && (
                            <div className="animate-shake rounded-lg border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                                        <span className="text-xl">⚠️</span>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="font-bold text-red-400">
                                            Submission Failed
                                        </p>
                                        <div className="space-y-1">
                                            {Object.entries(errors).map(
                                                ([key, error]) => (
                                                    <p
                                                        key={key}
                                                        className="font-mono text-sm text-red-300"
                                                    >
                                                        • {error}
                                                    </p>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FORM */}
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="group">
                                <label className="mb-2 ml-1 flex items-center gap-2 font-mono text-m text-cyan-500">
                                    Name
                                    <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className={`w-full border-b ${
                                        errors.name
                                            ? 'border-red-500 bg-red-500/5'
                                            : 'border-white/20'
                                    } bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none`}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="group">
                                <label className="mb-2 ml-1 block font-mono text-m text-cyan-500">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="w-full border-b border-white/20 bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none"
                                    placeholder="+62 812 3456 7890"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="mb-2 ml-1 flex items-center gap-2 font-mono text-m text-cyan-500">
                                Email
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className={`w-full border-b ${
                                    errors.email
                                        ? 'border-red-500 bg-red-500/5'
                                        : 'border-white/20'
                                } bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none`}
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        <div className="group">
                            <label className="mb-2 ml-1 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-mono text-m text-cyan-500">
                                    Message
                                    <span className="text-red-400">*</span>
                                </div>
                                <span
                                    className={`font-mono text-[10px] ${
                                        data.message.length > 2000
                                            ? 'text-red-400'
                                            : 'text-slate-600'
                                    }`}
                                >
                                    {data.message.length}/2000
                                </span>
                            </label>
                            <textarea
                                rows="5"
                                value={data.message}
                                onChange={(e) =>
                                    setData('message', e.target.value)
                                }
                                maxLength={2000}
                                className={`w-full border-b ${
                                    errors.message
                                        ? 'border-red-500 bg-red-500/5'
                                        : 'border-white/20'
                                } bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none`}
                                placeholder="Tell me about your project..."
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-6">
                            <p className="font-mono text-xs text-slate-600">
                                <span className="text-red-400">*</span> Required
                                fields
                            </p>
                            <button
                                onClick={handleContactSubmit}
                                disabled={processing}
                                className="group relative inline-flex items-center gap-3 rounded-sm bg-cyan-600 px-10 py-4 font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <LoadingOutlined className="animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <SendOutlined />
                                        <span>Send Message</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-white/5 bg-[#020617]/80 py-12 text-center backdrop-blur-sm">
                <div className="mb-8 flex justify-center gap-6">
                    {[
                        {
                            icon: <GithubOutlined />,
                            url: profile.social?.github,
                        },
                        {
                            icon: <LinkedinOutlined />,
                            url: profile.social?.linkedin,
                        },
                        {
                            icon: <TwitterOutlined />,
                            url: profile.social?.twitter,
                        },
                    ].map((social, i) => (
                        <a
                            key={i}
                            href={social.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-2xl text-slate-500 transition-colors hover:text-cyan-400"
                        >
                            {social.icon}
                        </a>
                    ))}
                </div>
                <div className="font-mono text-xs text-slate-600">
                    &copy; {new Date().getFullYear()} {profile.name}. All rights
                    reserved.
                </div>
            </footer>

            {/* MODAL CERTIFICATE PREVIEW */}
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
                                alt="Certificate"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
