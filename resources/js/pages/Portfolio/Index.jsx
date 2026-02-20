// ============================================================================
// 📁 resources/js/Pages/Portfolio/Index.jsx
// ============================================================================
// REFACTORED: Lightweight orchestrator.
// Setiap section punya state & animasi sendiri → re-render terisolasi.
// GSAP hanya menangani splash + hero entry di sini.
// ============================================================================

import { Head, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BackgroundGradientAnimation } from '../../../../components/ui/background-gradient-animation';
import PageLoader from './PageLoader';

// 🔥 LAZY LOAD: Sections below the fold tidak di-bundle di initial chunk
import HeroSection from './sections/HeroSection';
import Navbar from './sections/Navbar';
const TechMarquee = lazy(() => import('./sections/TechMarquee'));
const BioSection = lazy(() => import('./sections/BioSection'));
const ExperienceTimeline = lazy(() => import('./sections/ExperienceTimeline'));
const ProjectsSection = lazy(() => import('./sections/ProjectsSection'));
const CertificatesSection = lazy(
    () => import('./sections/CertificatesSection'),
);
const BlogsSection = lazy(() => import('./sections/BlogsSection'));
const ContactSection = lazy(() => import('./sections/ContactSection'));
const Footer = lazy(() => import('./sections/Footer'));

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ============================================================================
// SECTION FALLBACK (skeleton saat lazy component loading)
// ============================================================================
function SectionSkeleton() {
    return (
        <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PortfolioIndex({
    profile = {
        name: 'Developer',
        bio: '',
        avatar: '',
        stats: null,
        social: {},
    },
    projects = { data: [], next_page_url: null },
    projectTypes = [],
    certificates = { data: [], next_page_url: null },
    recent_blogs = [],
    experiences = [],
}) {
    const { flash } = usePage().props;
    const containerRef = useRef(null);
    const [splashDone, setSplashDone] = useState(false);

    // ================================================================
    // SPLASH SCREEN ANIMATION (satu-satunya GSAP di orchestrator)
    // ================================================================
    useEffect(() => {
        // Kill stale triggers dari navigasi Inertia sebelumnya
        ScrollTrigger.getAll().forEach((t) => t.kill());

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => setSplashDone(true),
            });

            tl.to('.counter', {
                innerText: 100,
                duration: 1.2, // Dipercepat dari 1.5
                snap: { innerText: 1 },
                ease: 'power2.out',
            })
                .to(
                    '.loader-bar',
                    { width: '100%', duration: 1.2, ease: 'power2.inOut' },
                    '<',
                )
                .to('.splash-content', { opacity: 0, y: -50, duration: 0.4 })
                .to('.splash-screen', {
                    yPercent: -100,
                    duration: 0.6, // Dipercepat dari 0.8
                    ease: 'power4.inOut',
                });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // ================================================================
    // SCROLL REVEAL (generic, delegated ke IntersectionObserver)
    // Lebih performa daripada GSAP ScrollTrigger untuk reveal sederhana
    // ================================================================
    useEffect(() => {
        if (!splashDone) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
        );

        document
            .querySelectorAll('.reveal-on-scroll')
            .forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [splashDone]);

    // ================================================================
    // RENDER
    // ================================================================
    return (
        <div
            ref={containerRef}
            className="min-h-screen overflow-x-hidden bg-[#020617] font-['Space_Grotesk'] text-slate-200 selection:bg-cyan-500 selection:text-white"
        >
            <Head title={`Portfolio - ${profile.name}`} />
            <PageLoader />

            {/* ==================== SPLASH SCREEN ==================== */}
            <div className="splash-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617]">
                <div className="splash-content w-full max-w-md px-6 text-center">
                    <div className="mb-2 flex justify-between">
                        <span className="font-mono text-cyan-500">Loading</span>
                        <span className="text-4xl font-bold text-white">
                            <span className="counter">0</span>%
                        </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                        <div className="loader-bar h-full w-0 bg-cyan-500 shadow-[0_0_15px_cyan]" />
                    </div>
                </div>
            </div>

            {/* ==================== ANIMATED BACKGROUND ==================== */}
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
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                <div className="bg-grid-pattern absolute inset-0 opacity-[0.15]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.4)_100%)]" />
            </div>

            {/* ==================== ABOVE THE FOLD (eager loaded) ==================== */}
            <Navbar profileName={profile.name} />
            <HeroSection profile={profile} splashDone={splashDone} />

            {/* ==================== BELOW THE FOLD (lazy loaded) ==================== */}
            <Suspense fallback={<SectionSkeleton />}>
                <TechMarquee />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <BioSection profile={profile} />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <ExperienceTimeline experiences={experiences} />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <ProjectsSection
                    initialProjects={projects}
                    projectTypes={projectTypes}
                />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <CertificatesSection initialCertificates={certificates} />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <BlogsSection blogs={recent_blogs} />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <ContactSection flash={flash} />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <Footer profile={profile} />
            </Suspense>
        </div>
    );
}
