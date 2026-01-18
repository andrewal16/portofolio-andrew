import {
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    RocketOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { Head, Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import PageLoader from './PageLoader';
// import PageLoader from '../../../../components/PageLoader';

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceDetail({ experience, related_experiences }) {
    const containerRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isContentReady, setIsContentReady] = useState(false);

    const getEmploymentBadge = () => {
        const colorMap = {
            green: 'border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]',
            cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
            purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
            blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
            orange: 'border-orange-500/30 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.2)]',
        };
        return colorMap[experience.employment_type_color] || colorMap.blue;
    };

    useEffect(() => {
        ScrollTrigger.getAll().forEach((t) => t.kill());

        // Small delay to ensure DOM is ready after page transition
        const initTimer = setTimeout(() => {
            setIsContentReady(true);
        }, 100);

        return () => clearTimeout(initTimer);
    }, [experience.slug]);

    useEffect(() => {
        if (!isContentReady) return;

        const ctx = gsap.context(() => {
            // Master timeline for entrance
            const masterTl = gsap.timeline();

            // Initial states
            gsap.set(
                [
                    '.animate-back',
                    '.animate-title',
                    '.animate-meta',
                    '.animate-content',
                    '.animate-sidebar',
                ],
                {
                    opacity: 0,
                },
            );

            // Cinematic reveal sequence
            masterTl
                // Background glow pulse
                .fromTo(
                    '.hero-glow',
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
                )
                // Back button slides in
                .to(
                    '.animate-back',
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                    },
                    '-=0.5',
                )
                // Company logo scales up with bounce
                .fromTo(
                    '.company-logo-wrapper',
                    { scale: 0, rotation: -10 },
                    {
                        scale: 1,
                        rotation: 0,
                        duration: 0.6,
                        ease: 'back.out(1.7)',
                    },
                    '-=0.3',
                )
                // Badges slide in
                .to(
                    '.animate-meta',
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.1,
                        duration: 0.5,
                        ease: 'power3.out',
                    },
                    '-=0.3',
                )
                // Title reveal with clip-path
                .to(
                    '.animate-title',
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power4.out',
                    },
                    '-=0.4',
                )
                // Duration info
                .fromTo(
                    '.duration-info',
                    { width: 0 },
                    { width: 'auto', duration: 0.6, ease: 'power2.out' },
                    '-=0.4',
                )
                // Content sections
                .to(
                    '.animate-content',
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.15,
                        duration: 0.8,
                        ease: 'power3.out',
                    },
                    '-=0.3',
                )
                // Sidebar items
                .to(
                    '.animate-sidebar',
                    {
                        opacity: 1,
                        x: 0,
                        stagger: 0.2,
                        duration: 0.6,
                        ease: 'power2.out',
                    },
                    '-=0.6',
                );

            // Set initial transform values
            gsap.set('.animate-back', { x: -30 });
            gsap.set('.animate-meta', { y: 20 });
            gsap.set('.animate-title', { y: 40 });
            gsap.set('.animate-content', { y: 50 });
            gsap.set('.animate-sidebar', { x: 40 });

            // Gallery items with stagger on scroll
            if (experience.gallery?.length > 0) {
                gsap.fromTo(
                    '.animate-gallery-item',
                    { y: 60, opacity: 0, scale: 0.9 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        stagger: 0.1,
                        duration: 0.7,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: '.gallery-section',
                            start: 'top 85%',
                        },
                    },
                );
            }

            // Achievement items animate on scroll
            gsap.fromTo(
                '.achievement-item',
                { x: -30, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    stagger: 0.15,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.achievements-section',
                        start: 'top 80%',
                    },
                },
            );

            // Related experiences
            if (related_experiences?.length > 0) {
                setTimeout(() => {
                    ScrollTrigger.refresh();
                    gsap.fromTo(
                        '.related-exp-card',
                        { y: 60, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            stagger: 0.15,
                            duration: 0.7,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: '.related-section',
                                start: 'top 85%',
                            },
                        },
                    );
                }, 200);
            }

            // Parallax effect on hero glow
            gsap.to('.hero-glow', {
                y: 100,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, [isContentReady, experience.slug]);

    return (
        <div
            ref={containerRef}
            className="min-h-screen overflow-x-hidden bg-[#020617] font-['Space_Grotesk'] text-slate-200 selection:bg-green-500 selection:text-white"
        >
            <Head
                title={`${experience.position} at ${experience.company_name} | Experience`}
            />

            {/* Page Transition Loader */}
            <PageLoader />

            {/* Background Effects */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="bg-grid-pattern absolute inset-0 opacity-[0.1]"></div>
                {/* Animated hero glow */}
                <div
                    className="hero-glow absolute top-0 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full opacity-0"
                    style={{
                        background:
                            'radial-gradient(ellipse at center, rgba(34,197,94,0.15) 0%, rgba(6,182,212,0.1) 40%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
            </div>

            {/* Navbar */}
            <div className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 px-6 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <Link
                        href={route('portfolio.index')}
                        className="animate-back group inline-flex items-center gap-2 font-mono text-sm text-slate-400 transition-colors hover:text-green-400"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all group-hover:border-green-500/50 group-hover:bg-green-500/10 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            <ArrowLeftOutlined />
                        </div>
                        <span className="hidden sm:inline">
                            BACK_TO_PORTFOLIO
                        </span>
                    </Link>
                    <div className="animate-back flex items-center gap-2">
                        <span
                            className={`h-2 w-2 rounded-full ${experience.is_current ? 'animate-pulse bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-slate-600'}`}
                        ></span>
                        <span className="font-mono text-xs tracking-widest text-slate-500 uppercase">
                            {experience.is_current
                                ? 'Currently Here'
                                : 'Past Experience'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 pt-12 pb-8">
                <div className="mx-auto max-w-7xl">
                    {/* Company Logo */}
                    <div className="animate-meta mb-6 flex items-center gap-4">
                        <div className="company-logo-wrapper flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-950 p-3 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                            {experience.company_logo ? (
                                <img
                                    src={experience.company_logo}
                                    alt={experience.company_name}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-green-500">
                                    {experience.company_name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {experience.company_name}
                            </h2>
                            <p className="font-mono text-sm text-slate-400">
                                {experience.location}
                                {experience.is_remote && ' • Remote'}
                            </p>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="animate-meta mb-6 flex flex-wrap items-center gap-3">
                        <div
                            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase backdrop-blur-sm ${getEmploymentBadge()}`}
                        >
                            <RocketOutlined />
                            <span>{experience.employment_type_label}</span>
                        </div>
                        {experience.is_current && (
                            <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-green-400 uppercase shadow-[0_0_15px_rgba(34,197,94,0.2)] backdrop-blur-sm">
                                <CheckCircleOutlined />
                                <span>Currently Working</span>
                            </div>
                        )}
                        {experience.is_featured && (
                            <div className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-yellow-400 uppercase">
                                ⭐ Featured Role
                            </div>
                        )}
                    </div>

                    {/* Position Title with gradient */}
                    <h1 className="animate-title mb-4 text-4xl leading-tight font-bold md:text-6xl lg:text-7xl">
                        <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            {experience.position}
                        </span>
                    </h1>

                    {/* Duration with reveal animation */}
                    <div className="duration-info animate-title flex items-center gap-2 overflow-hidden font-mono text-lg text-slate-400">
                        <CalendarOutlined className="text-green-500" />
                        {experience.formatted_duration}
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500">
                            {experience.duration_text}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* LEFT: Main Content */}
                    <div className="space-y-12 lg:col-span-2">
                        {/* Overview */}
                        <div className="animate-content space-y-6">
                            <h3 className="flex items-center gap-3 text-2xl font-bold text-white">
                                <span className="text-green-500">//</span>{' '}
                                Overview
                            </h3>
                            <div className="prose max-w-none font-['Inter'] text-lg leading-relaxed whitespace-pre-line text-slate-400 prose-invert">
                                {experience.detailed_description ||
                                    experience.description}
                            </div>
                        </div>

                        {/* Key Achievements */}
                        {experience.key_achievements?.length > 0 && (
                            <div className="achievements-section animate-content space-y-6">
                                <h3 className="flex items-center gap-3 text-2xl font-bold text-white">
                                    <span className="text-green-500">//</span>{' '}
                                    Key Achievements
                                </h3>
                                <div className="space-y-4">
                                    {experience.key_achievements.map(
                                        (achievement, idx) => (
                                            <div
                                                key={idx}
                                                className="achievement-item group flex gap-4 rounded-lg border border-white/10 bg-slate-900/40 p-4 transition-all duration-300 hover:border-green-500/30 hover:bg-slate-900/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                            >
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500 transition-all group-hover:bg-green-500/20 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                                    <CheckCircleOutlined />
                                                </div>
                                                <p className="flex-1 font-['Inter'] leading-relaxed text-slate-300">
                                                    {achievement}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Photo Gallery */}
                        {experience.gallery?.length > 0 && (
                            <div className="gallery-section animate-content space-y-6">
                                <h3 className="flex items-center gap-3 text-2xl font-bold text-white">
                                    <span className="text-green-500">//</span>{' '}
                                    Documentation
                                </h3>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                    {experience.gallery.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() =>
                                                setSelectedImage(img)
                                            }
                                            className="animate-gallery-item group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-slate-900 transition-all duration-500 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                                        >
                                            <img
                                                src={img}
                                                alt={`${experience.company_name} documentation ${idx + 1}`}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40"></div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                                <div className="rounded-full bg-white/10 p-3 backdrop-blur-sm">
                                                    <svg
                                                        className="h-6 w-6 text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Sidebar */}
                    <div className="space-y-6">
                        {/* Metrics */}
                        {experience.metrics?.length > 0 && (
                            <div className="animate-sidebar rounded-xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:border-green-500/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                                <h4 className="mb-4 border-b border-white/10 pb-2 font-mono text-xs tracking-widest text-slate-500 uppercase">
                                    <ThunderboltOutlined className="mr-2" />{' '}
                                    Impact Metrics
                                </h4>
                                <div className="space-y-3">
                                    {experience.metrics.map((metric, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 rounded border border-green-500/20 bg-green-500/5 p-3 transition-all hover:border-green-500/40 hover:bg-green-500/10"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                                                <ThunderboltOutlined />
                                            </div>
                                            <span className="font-mono text-sm font-bold text-green-300">
                                                {metric}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tech Stack */}
                        {experience.tech_stack?.length > 0 && (
                            <div className="animate-sidebar rounded-xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:border-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                <h4 className="mb-4 border-b border-white/10 pb-2 font-mono text-xs tracking-widest text-slate-500 uppercase">
                                    <ThunderboltOutlined className="mr-2" />{' '}
                                    Tech Stack
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {experience.tech_stack.map((tech, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded border border-green-500/20 bg-green-500/5 px-3 py-1.5 font-mono text-xs font-semibold text-green-300 transition-all hover:border-green-500/50 hover:bg-green-500/10 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timeline Info */}
                        <div className="animate-sidebar rounded-xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
                            <h4 className="mb-4 border-b border-white/10 pb-2 font-mono text-xs tracking-widest text-slate-500 uppercase">
                                <ClockCircleOutlined className="mr-2" />{' '}
                                Timeline
                            </h4>
                            <div className="space-y-4 font-mono text-sm">
                                <div>
                                    <div className="text-xs text-slate-500">
                                        START DATE
                                    </div>
                                    <div className="text-white">
                                        {experience.start_date}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">
                                        END DATE
                                    </div>
                                    <div
                                        className={
                                            experience.is_current
                                                ? 'text-green-400'
                                                : 'text-white'
                                        }
                                    >
                                        {experience.end_date}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">
                                        DURATION
                                    </div>
                                    <div className="text-white">
                                        {experience.duration_text}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Experiences */}
                {related_experiences?.length > 0 && (
                    <div className="related-section mt-32 border-t border-white/10 pt-16">
                        <div className="mb-10">
                            <h3 className="text-3xl font-bold text-white">
                                Related Experiences
                            </h3>
                            <p className="mt-2 font-mono text-slate-500">
                                MORE FROM MY JOURNEY
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {related_experiences.map((exp, idx) => (
                                <Link
                                    href={route(
                                        'portfolio.experience.show',
                                        exp.slug,
                                    )}
                                    key={idx}
                                    className="related-exp-card group block overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 transition-all duration-500 hover:-translate-y-2 hover:border-green-500/50 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)]"
                                >
                                    {/* Top loading bar */}
                                    <div className="h-1 w-0 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500 transition-all duration-300 group-hover:w-full"></div>
                                    <div className="p-6">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-950 p-2 transition-all group-hover:border-green-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                                {exp.company_logo ? (
                                                    <img
                                                        src={exp.company_logo}
                                                        alt={exp.company_name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-bold text-green-500">
                                                        {exp.company_name.charAt(
                                                            0,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-white">
                                                    {exp.company_name}
                                                </h4>
                                                <p className="font-mono text-xs text-slate-500">
                                                    {exp.formatted_duration}
                                                </p>
                                            </div>
                                        </div>
                                        <h5 className="mb-2 line-clamp-2 font-bold text-white transition-colors group-hover:text-green-400">
                                            {exp.position}
                                        </h5>
                                        <p className="line-clamp-2 font-['Inter'] text-sm text-slate-400">
                                            {exp.description}
                                        </p>
                                        <div className="mt-4 flex items-center font-mono text-xs text-slate-500 transition-colors group-hover:text-green-400">
                                            <span>View Details</span>
                                            <ArrowLeftOutlined className="ml-2 rotate-180 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Image Modal with GSAP animation */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-6 backdrop-blur-md"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        onClick={() => setSelectedImage(null)}
                    >
                        ✕
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-h-[90vh] max-w-[90vw] rounded-xl border border-white/10 object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
