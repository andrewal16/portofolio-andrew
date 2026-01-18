import {
    ArrowRightOutlined,
    CalendarOutlined,
    CloseOutlined,
    CodeOutlined,
    DownloadOutlined,
    FileOutlined,
    GithubOutlined,
    GlobalOutlined,
    LinkedinOutlined,
    LoadingOutlined,
    ReadOutlined,
    RocketOutlined,
    SafetyCertificateOutlined,
    SendOutlined,
    ThunderboltOutlined,
    TrophyOutlined,
    TwitterOutlined,
} from '@ant-design/icons';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Modal, message } from 'antd';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { useEffect, useRef, useState } from 'react';
 import { BackgroundGradientAnimation } from '../../../../components/ui/background-gradient-animation';
import PageLoader from './PageLoader';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

export default function PortfolioIndex({
    profile,
    projects,
    certificates,
    recent_blogs,
    experiences,
}) {
    const { flash } = usePage().props;
    const [isLoading, setIsLoading] = useState(true);
    const [previewCert, setPreviewCert] = useState(null);
    const [pdfError, setPdfError] = useState(false);
    const [projectList, setProjectList] = useState(projects.data || []);
    const [nextPageUrl, setNextPageUrl] = useState(projects.next_page_url);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const containerRef = useRef(null);
    const cursorRef = useRef(null);
    const textRef = useRef(null);
    const marqueeRef = useRef(null);
    const contactSectionRef = useRef(null);
    const bioSectionRef = useRef(null);
    const bioStatsRef = useRef(null);

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

    const defaultStats = [
        { value: '3+', label: 'Years Exp', icon: <ThunderboltOutlined /> },
        { value: '20+', label: 'Projects', icon: <CodeOutlined /> },
        { value: '10+', label: 'Tech Stack', icon: <GlobalOutlined /> },
        { value: 'Top 1%', label: 'AI4Impact', icon: <TrophyOutlined /> },
    ];
    const stats = profile.stats || defaultStats;

    const isPDF = (url) => url && url.toLowerCase().endsWith('.pdf');
    const getPDFThumbnail = (pdfUrl) => {
        if (!pdfUrl || !pdfUrl.includes('cloudinary.com')) return null;
        const urlParts = pdfUrl.split('/upload/');
        if (urlParts.length === 2)
            return (
                urlParts[0] +
                '/upload/pg_1,w_600,h_400,c_fill,f_jpg,q_auto/' +
                urlParts[1]
            );
        return null;
    };
    const getCertificateThumbnail = (cert) =>
        isPDF(cert.image) ? getPDFThumbnail(cert.image) : cert.image;

    const handleDownloadPDF = (url, filename) => {
        try {
            if (url.includes('cloudinary.com')) {
                const urlParts = url.split('/upload/');
                if (urlParts.length === 2) {
                    window.open(
                        urlParts[0] + '/upload/fl_attachment/' + urlParts[1],
                        '_blank',
                        'noopener,noreferrer',
                    );
                    message.success('Download started!');
                    return;
                }
            }
            window.open(url, '_blank');
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    setIsLoading(false);
                    startTypewriter();
                },
            });

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

            gsap.to(marqueeRef.current, {
                xPercent: -50,
                repeat: -1,
                duration: 25,
                ease: 'linear',
            });

            gsap.utils.toArray('.reveal-section').forEach((section) => {
                gsap.from(section, {
                    scrollTrigger: { trigger: section, start: 'top 80%' },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                });
            });

            // Bio Section Animations
            gsap.from('.bio-reveal', {
                scrollTrigger: {
                    trigger: bioSectionRef.current,
                    start: 'top 80%',
                },
                y: 60,
                opacity: 0,
                stagger: 0.15,
                duration: 1,
                ease: 'power3.out',
            });

            gsap.from('.stat-item', {
                scrollTrigger: {
                    trigger: bioStatsRef.current,
                    start: 'top 85%',
                },
                scale: 0.8,
                opacity: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'back.out(1.7)',
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

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

    useEffect(() => {
        gsap.to(cursorRef.current, {
            opacity: 0,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true,
            duration: 0.5,
        });
    }, []);

    useEffect(() => {
        if (flash?.success && contactSectionRef.current) {
            setTimeout(
                () =>
                    contactSectionRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    }),
                300,
            );
        }
    }, [flash?.success]);

    const handleLoadMore = async () => {
        if (!nextPageUrl) return;
        setIsLoadingMore(true);
        try {
            const res = await fetch(nextPageUrl, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const json = await res.json();
                setProjectList((prev) => [
                    ...prev,
                    ...(json.data || json.projects?.data || []),
                ]);
                setNextPageUrl(
                    json.next_page_url || json.projects?.next_page_url,
                );
                setTimeout(
                    () =>
                        gsap.fromTo(
                            '.project-card-new',
                            { opacity: 0, y: 30 },
                            { opacity: 1, y: 0, stagger: 0.1 },
                        ),
                    100,
                );
            }
        } catch (err) {
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
            onError: () =>
                message.error('Please check your inputs and try again.'),
        });
    };

    return (
        <div
            ref={containerRef}
            className="min-h-screen overflow-x-hidden bg-[#020617] font-['Space_Grotesk'] text-slate-200 selection:bg-cyan-500 selection:text-white"
        >
            <Head title={`Portfolio - ${profile.name}`} />
            <PageLoader />

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
                                        .getElementById('experience')
                                        .scrollIntoView({ behavior: 'smooth' })
                                }
                                className="rounded-full bg-cyan-600 px-8 py-3 font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 hover:bg-cyan-500"
                            >
                                View Experience
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

            {/* ✨ NEW: ABOUT ME / BIO SECTION */}
            <section
                ref={bioSectionRef}
                className="relative z-10 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#020617] via-[#0a101f] to-[#020617] px-6 py-32"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]"></div>
                    <div className="absolute right-1/4 -bottom-20 h-[400px] w-[400px] rounded-full bg-green-500/5 blur-[100px]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="bio-reveal mb-16 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-5 py-2 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative h-2 w-2 rounded-full bg-cyan-500"></span>
                            </span>
                            <span className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase">
                                About Me
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
                        {/* Left: Visual Card */}
                        <div className="bio-reveal lg:col-span-5">
                            <div className="relative mx-auto max-w-md lg:mx-0">
                                <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-8 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_60px_rgba(6,182,212,0.15)]">
                                    <div className="relative mb-6 flex justify-center">
                                        <div className="relative">
                                            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 opacity-20 blur-xl transition-all duration-500 group-hover:opacity-40"></div>
                                            <div className="absolute -inset-1 animate-[spin_8s_linear_infinite] rounded-full bg-gradient-to-r from-cyan-500 via-green-500 to-cyan-500 opacity-75"></div>
                                            <img
                                                src={profile.avatar}
                                                alt={profile.name}
                                                className="relative h-40 w-40 rounded-full border-4 border-slate-900 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute -right-2 -bottom-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-900 bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
                                                <RocketOutlined className="text-lg text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-center">
                                        <h3 className="mb-2 text-2xl font-bold text-white">
                                            {profile.name}
                                        </h3>
                                        <p className="mb-4 font-mono text-sm text-cyan-400">
                                            {profile.title ||
                                                'Full-Stack Developer'}
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {['Laravel', 'React', 'Python'].map(
                                                (tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition-all hover:border-cyan-500/30 hover:text-cyan-400"
                                                    >
                                                        {tag}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative z-10 mt-6 rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                                                <TrophyOutlined className="text-lg text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="font-mono text-xs text-yellow-400/80">
                                                    ACHIEVEMENT
                                                </p>
                                                <p className="font-bold text-yellow-300">
                                                    AI4Impact Scholar
                                                </p>
                                            </div>
                                            <div className="ml-auto rounded-full bg-yellow-500/20 px-3 py-1">
                                                <span className="font-mono text-xs font-bold text-yellow-400">
                                                    Top 0.26%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-6 -right-6 hidden animate-[float_4s_ease-in-out_infinite] rounded-xl border border-cyan-500/20 bg-slate-900/80 p-3 backdrop-blur-sm lg:block">
                                    <CodeOutlined className="text-2xl text-cyan-400" />
                                </div>
                                <div className="absolute -bottom-4 -left-4 hidden animate-[float_4s_ease-in-out_infinite_1s] rounded-xl border border-green-500/20 bg-slate-900/80 p-3 backdrop-blur-sm lg:block">
                                    <GlobalOutlined className="text-2xl text-green-400" />
                                </div>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="space-y-8 lg:col-span-7">
                            <div className="bio-reveal">
                                <h2 className="mb-4 text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl">
                                    Crafting Digital
                                    <span className="block bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
                                        Experiences
                                    </span>
                                </h2>
                            </div>
                            <div className="bio-reveal space-y-4">
                                <p className="text-lg leading-relaxed text-slate-300">
                                    {profile.bio}
                                </p>
                                {profile.bio_extended && (
                                    <p className="leading-relaxed text-slate-400">
                                        {profile.bio_extended}
                                    </p>
                                )}
                            </div>
                            <div
                                ref={bioStatsRef}
                                className="bio-reveal grid grid-cols-2 gap-4 md:grid-cols-4"
                            >
                                {stats.map((stat, idx) => (
                                    <div
                                        key={idx}
                                        className="stat-item group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-slate-900/60 hover:shadow-[0_10px_40px_rgba(6,182,212,0.1)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 transition-all duration-300 group-hover:from-cyan-500/5 group-hover:to-transparent"></div>
                                        <div className="relative z-10">
                                            <div className="mb-2 text-3xl font-bold text-white transition-colors group-hover:text-cyan-400">
                                                {stat.value}
                                            </div>
                                            <div className="font-mono text-xs tracking-wider text-slate-500 uppercase">
                                                {stat.label}
                                            </div>
                                        </div>
                                        <div className="absolute -right-2 -bottom-2 text-4xl text-white/5 transition-all duration-300 group-hover:text-cyan-500/10">
                                            {stat.icon || (
                                                <ThunderboltOutlined />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bio-reveal flex flex-wrap gap-4 pt-4">
                                <a
                                    href="#experience"
                                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500 px-8 py-4 font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40"
                                >
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                                    <span className="relative">
                                        View My Journey
                                    </span>
                                    <RocketOutlined className="relative transition-transform group-hover:translate-x-1" />
                                </a>
                                <a
                                    href="#contact"
                                    className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-bold text-slate-300 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                >
                                    <span>Let's Connect</span>
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs transition-all group-hover:bg-cyan-500/20 group-hover:text-cyan-400">
                                        →
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`}</style>
            </section>

            {/* ⭐ EXPERIENCE TIMELINE - NOW SECTION 01 */}
            <section
                id="experience"
                className="relative z-10 border-b border-white/5 bg-[#020617]/90 px-6 py-32 backdrop-blur-sm"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="reveal-section mb-16 flex items-center gap-4">
                        <span className="block font-mono text-2xl font-bold tracking-widest text-green-500">
                            01 / Experience
                        </span>
                        <div className="h-[1px] flex-grow bg-slate-800"></div>
                    </div>

                    <div className="relative">
                        <div className="absolute top-0 bottom-0 left-8 w-[2px] bg-gradient-to-b from-green-500/50 via-cyan-500/30 to-transparent md:left-12"></div>
                        <div className="space-y-12">
                            {experiences.map((exp, idx) => (
                                <Link
                                    href={route(
                                        'portfolio.experience.show',
                                        exp.slug,
                                    )}
                                    key={exp.id}
                                    className="reveal-section group relative block"
                                >
                                    <div className="absolute top-8 left-8 z-20 flex h-4 w-4 -translate-x-1/2 items-center justify-center md:left-12">
                                        <span className="absolute h-full w-full animate-ping rounded-full bg-green-500 opacity-75 group-hover:bg-cyan-500"></span>
                                        <span
                                            className={`relative h-3 w-3 rounded-full ${exp.is_current ? 'bg-green-500' : 'bg-cyan-600'} ring-4 ring-slate-900 transition-all duration-300 group-hover:scale-125 group-hover:ring-green-500/30`}
                                        ></span>
                                    </div>
                                    <div className="ml-16 overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-green-500/50 hover:bg-slate-900/60 hover:shadow-[0_0_40px_rgba(34,197,94,0.2)] md:ml-24">
                                        <div className="h-1 w-0 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500 transition-all duration-300 group-hover:w-full"></div>
                                        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:gap-8">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-950 p-2 transition-all duration-300 group-hover:border-green-500/50 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                                    {exp.company_logo ? (
                                                        <img
                                                            src={
                                                                exp.company_logo
                                                            }
                                                            alt={
                                                                exp.company_name
                                                            }
                                                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl font-bold text-green-500">
                                                            {exp.company_name.charAt(
                                                                0,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="relative text-xl font-bold text-white transition-colors group-hover:text-green-400">
                                                            {exp.position}
                                                            <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
                                                        </h3>
                                                        <p className="mt-1 font-mono text-sm text-slate-400">
                                                            {exp.company_name}
                                                        </p>
                                                    </div>
                                                    {exp.is_featured && (
                                                        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 font-mono text-xs text-yellow-400">
                                                            ⭐ Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-3 font-mono text-xs">
                                                    <span
                                                        className={`flex items-center gap-1.5 rounded border px-2.5 py-1 ${exp.employment_type_color === 'green' ? 'border-green-500/30 bg-green-500/10 text-green-400' : exp.employment_type_color === 'cyan' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' : exp.employment_type_color === 'purple' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'}`}
                                                    >
                                                        {
                                                            exp.employment_type_label
                                                        }
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-slate-500">
                                                        <CalendarOutlined className="text-green-500" />
                                                        {exp.formatted_duration}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-slate-500">
                                                        📍 {exp.location}
                                                        {exp.is_remote &&
                                                            ' (Remote)'}
                                                    </span>
                                                </div>
                                                <p className="line-clamp-2 font-['Inter'] text-sm leading-relaxed text-slate-400">
                                                    {exp.description}
                                                </p>
                                                {exp.tech_stack?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {exp.tech_stack
                                                            .slice(0, 5)
                                                            .map((tech, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="rounded border border-green-500/20 bg-green-500/5 px-2 py-1 text-[10px] font-bold text-green-400 uppercase"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        {exp.tech_stack.length >
                                                            5 && (
                                                            <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-500">
                                                                +
                                                                {exp.tech_stack
                                                                    .length -
                                                                    5}{' '}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 pt-2 font-mono text-sm font-bold text-slate-500 transition-colors group-hover:text-green-400">
                                                    <span>View Details</span>
                                                    <ArrowRightOutlined className="-translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {(idx === 0 ||
                                        exp.display_date !==
                                            experiences[idx - 1]
                                                ?.display_date) && (
                                        <div className="absolute top-0 left-0 -translate-y-8 font-mono text-xs font-bold text-slate-700 md:left-12 md:-translate-x-20">
                                            {exp.display_date}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* PROJECTS SECTION - NOW SECTION 02 */}
            <section id="projects" className="relative z-10 px-6 py-32">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal-section mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
                        <div>
                            <span className="mb-4 block font-mono text-2xl font-bold tracking-widest text-cyan-500">
                                02 / Portfolio
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

                    {nextPageUrl && (
                        <div className="reveal-section mt-16 text-center">
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
                        </div>
                    )}
                </div>
            </section>

            {/* CERTIFICATES - NOW SECTION 03 */}
            <section className="relative z-10 border-y border-white/5 bg-[#0a0f1e]/80 px-6 py-32 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal-section mb-12 flex items-center gap-4">
                        <span className="block font-mono text-2xl font-bold tracking-widest text-indigo-500">
                            03 / Certifications
                        </span>
                        <div className="h-[1px] flex-grow bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((cert) => {
                            const isFilePDF = isPDF(cert.image);
                            const thumbnail = getCertificateThumbnail(cert);
                            return (
                                <div
                                    key={cert.id}
                                    onClick={() => {
                                        setPreviewCert(cert);
                                        setPdfError(false);
                                    }}
                                    className="reveal-section group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]"
                                >
                                    <div className="absolute inset-0 h-full w-full bg-slate-950">
                                        {thumbnail ? (
                                            <img
                                                src={thumbnail}
                                                alt={cert.title}
                                                className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-900/30 via-slate-900 to-slate-950">
                                                <FileOutlined className="text-6xl text-indigo-400 opacity-40" />
                                                <p className="mt-4 font-mono text-xs text-indigo-300/60">
                                                    PDF CERTIFICATE
                                                </p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent"></div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 z-20 w-full p-6">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 backdrop-blur-md">
                                                <SafetyCertificateOutlined className="text-xs text-indigo-400" />
                                                <span className="font-mono text-[10px] tracking-wider text-indigo-300">
                                                    {isFilePDF
                                                        ? 'PDF • CLICK TO OPEN'
                                                        : 'VERIFIED'}
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* BLOGS SECTION - NOW SECTION 04 */}
            <section id="insights" className="relative z-10 px-6 py-32">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal-section mb-16 flex items-end justify-between gap-4">
                        <div>
                            <span className="mb-2 block font-mono text-2xl font-bold tracking-widest text-pink-500">
                                04 / Blog
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

            {/* CONTACT SECTION - NOW SECTION 05 */}
            <section
                id="contact"
                ref={contactSectionRef}
                className="relative z-10 border-t border-white/5 bg-[#020617]/80 px-6 py-24 backdrop-blur-sm"
            >
                <div className="mx-auto max-w-4xl">
                    <div className="reveal-section mb-16 text-center">
                        <span className="font-mono text-sm tracking-widest text-cyan-500">
                            05 / Contact
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
                        {flash?.success && (
                            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 backdrop-blur-sm">
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
                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-sm">
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
                        <div className="grid gap-8 md:grid-cols-2">
                            <div>
                                <label className="mb-2 ml-1 flex items-center gap-2 font-mono text-sm text-cyan-500">
                                    Name<span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className={`w-full border-b ${errors.name ? 'border-red-500 bg-red-500/5' : 'border-white/20'} bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none`}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="mb-2 ml-1 block font-mono text-sm text-cyan-500">
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
                        <div>
                            <label className="mb-2 ml-1 flex items-center gap-2 font-mono text-sm text-cyan-500">
                                Email<span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className={`w-full border-b ${errors.email ? 'border-red-500 bg-red-500/5' : 'border-white/20'} bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none`}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="mb-2 ml-1 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-mono text-sm text-cyan-500">
                                    Message
                                    <span className="text-red-400">*</span>
                                </div>
                                <span
                                    className={`font-mono text-[10px] ${data.message.length > 2000 ? 'text-red-400' : 'text-slate-600'}`}
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
                                className={`w-full border-b ${errors.message ? 'border-red-500 bg-red-500/5' : 'border-white/20'} bg-slate-950 px-4 py-3 text-white transition-all placeholder:text-slate-700 focus:border-cyan-500 focus:bg-slate-900/50 focus:outline-none`}
                                placeholder="Tell me about your project..."
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
                onCancel={() => {
                    setPreviewCert(null);
                    setPdfError(false);
                }}
                footer={null}
                centered
                width={1000}
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
                    <div className="relative">
                        <div className="border-b border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                            <div className="mb-2 flex items-center gap-2">
                                <SafetyCertificateOutlined className="text-indigo-400" />
                                <span className="font-mono text-xs text-indigo-400 uppercase">
                                    {isPDF(previewCert.image)
                                        ? 'PDF Certificate'
                                        : 'Image Certificate'}
                                </span>
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-white">
                                {previewCert.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="font-mono text-slate-400">
                                    <span className="text-slate-600">
                                        Issued by:
                                    </span>{' '}
                                    <span className="text-white">
                                        {previewCert.issuer}
                                    </span>
                                </span>
                                <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                                <span className="font-mono text-slate-400">
                                    <span className="text-slate-600">
                                        Date:
                                    </span>{' '}
                                    <span className="text-white">
                                        {previewCert.issued_date}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            {isPDF(previewCert.image) ? (
                                <div className="space-y-4">
                                    <div className="relative h-[70vh] w-full overflow-hidden rounded-lg border border-white/10 bg-slate-950">
                                        <object
                                            data={previewCert.image}
                                            type="application/pdf"
                                            className="h-full w-full"
                                        >
                                            <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
                                                <FileOutlined className="text-4xl text-slate-500" />
                                                <p className="text-slate-400">
                                                    Browser tidak mendukung
                                                    preview PDF.
                                                </p>
                                                <button
                                                    onClick={() =>
                                                        handleDownloadPDF(
                                                            previewCert.image,
                                                            `${previewCert.title}.pdf`,
                                                        )
                                                    }
                                                    className="rounded-full bg-cyan-600 px-6 py-2 font-bold text-white hover:bg-cyan-500"
                                                >
                                                    Download PDF
                                                </button>
                                            </div>
                                        </object>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() =>
                                                handleDownloadPDF(
                                                    previewCert.image,
                                                    `${previewCert.title}.pdf`,
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 font-mono text-sm text-cyan-300 hover:bg-cyan-500/20"
                                        >
                                            <DownloadOutlined />
                                            Download
                                        </button>
                                        {previewCert.credential_url && (
                                            <a
                                                href={
                                                    previewCert.credential_url
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 font-mono text-sm text-indigo-300 hover:bg-indigo-500/20"
                                            >
                                                <SafetyCertificateOutlined />
                                                Verify
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-white/10 bg-black/50 p-2">
                                    <img
                                        src={previewCert.image}
                                        className="h-auto max-h-[70vh] w-full object-contain"
                                        alt="Certificate"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
