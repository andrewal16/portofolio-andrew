// resources/js/components/Portfolio/HeroBioSection.jsx
import {
    CodeOutlined,
    GlobalOutlined,
    RocketOutlined,
    ThunderboltOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function HeroBioSection({ profile }) {
    const sectionRef = useRef(null);
    const statsRef = useRef(null);

    // Default stats jika tidak ada dari props
    const defaultStats = [
        { value: '3+', label: 'Years Experience', icon: <ThunderboltOutlined /> },
        { value: '20+', label: 'Projects Built', icon: <CodeOutlined /> },
        { value: '10+', label: 'Tech Stacks', icon: <GlobalOutlined /> },
        { value: 'Top 1%', label: 'AI4Impact', icon: <TrophyOutlined /> },
    ];

    const stats = profile.stats || defaultStats;

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate section elements
            gsap.from('.bio-reveal', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 60,
                opacity: 0,
                stagger: 0.15,
                duration: 1,
                ease: 'power3.out',
            });

            // Animate stats counter
            gsap.from('.stat-item', {
                scrollTrigger: {
                    trigger: statsRef.current,
                    start: 'top 85%',
                },
                scale: 0.8,
                opacity: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'back.out(1.7)',
            });

            // Parallax effect on decorative elements
            gsap.to('.bio-float-1', {
                y: -30,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });

            gsap.to('.bio-float-2', {
                y: 30,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative z-10 overflow-hidden border-y border-white/5 bg-gradient-to-b from-[#020617] via-[#0a101f] to-[#020617] px-6 py-32"
        >
            {/* Animated Background Elements */}
            <div className="pointer-events-none absolute inset-0">
                {/* Gradient Orbs */}
                <div className="bio-float-1 absolute -top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]"></div>
                <div className="bio-float-2 absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-green-500/5 blur-[100px]"></div>
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                
                {/* Floating Particles */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-cyan-500/40"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 mx-auto max-w-7xl">
                {/* Section Header */}
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
                    {/* Left: Visual Element */}
                    <div className="bio-reveal lg:col-span-5">
                        <div className="relative mx-auto max-w-md lg:mx-0">
                            {/* Main Card */}
                            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-8 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_60px_rgba(6,182,212,0.15)]">
                                {/* Animated Border Gradient */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-green-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ padding: '1px' }}>
                                    <div className="h-full w-full rounded-3xl bg-slate-950"></div>
                                </div>

                                {/* Profile Image */}
                                <div className="relative mb-6 flex justify-center">
                                    <div className="relative">
                                        {/* Glow Ring */}
                                        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 opacity-20 blur-xl transition-all duration-500 group-hover:opacity-40 group-hover:blur-2xl"></div>
                                        
                                        {/* Rotating Border */}
                                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-green-500 to-cyan-500 opacity-75" style={{ animation: 'spin 8s linear infinite' }}></div>
                                        
                                        {/* Image */}
                                        <img
                                            src={profile.avatar}
                                            alt={profile.name}
                                            className="relative h-40 w-40 rounded-full border-4 border-slate-900 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                        />
                                        
                                        {/* Status Badge */}
                                        <div className="absolute -right-2 -bottom-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-900 bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
                                            <RocketOutlined className="text-lg text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Name & Title */}
                                <div className="relative z-10 text-center">
                                    <h3 className="mb-2 text-2xl font-bold text-white">{profile.name}</h3>
                                    <p className="mb-4 font-mono text-sm text-cyan-400">{profile.title || 'Full-Stack Developer'}</p>
                                    
                                    {/* Quick Tags */}
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {['Laravel', 'React', 'Python'].map((tag, i) => (
                                            <span
                                                key={i}
                                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition-all hover:border-cyan-500/30 hover:text-cyan-400"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Achievement Banner */}
                                <div className="relative z-10 mt-6 rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                                            <TrophyOutlined className="text-lg text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-xs text-yellow-400/80">ACHIEVEMENT</p>
                                            <p className="font-bold text-yellow-300">AI4Impact Scholar</p>
                                        </div>
                                        <div className="ml-auto rounded-full bg-yellow-500/20 px-3 py-1">
                                            <span className="font-mono text-xs font-bold text-yellow-400">Top 0.26%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Decorative Cards */}
                            <div className="absolute -top-6 -right-6 hidden rounded-xl border border-cyan-500/20 bg-slate-900/80 p-3 backdrop-blur-sm lg:block" style={{ animation: 'float 4s ease-in-out infinite' }}>
                                <CodeOutlined className="text-2xl text-cyan-400" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-green-500/20 bg-slate-900/80 p-3 backdrop-blur-sm lg:block" style={{ animation: 'float 4s ease-in-out infinite 1s' }}>
                                <GlobalOutlined className="text-2xl text-green-400" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="space-y-8 lg:col-span-7">
                        {/* Headline */}
                        <div className="bio-reveal">
                            <h2 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                                Crafting Digital
                                <span className="block bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
                                    Experiences
                                </span>
                            </h2>
                        </div>

                        {/* Bio Paragraphs */}
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

                        {/* Stats Grid */}
                        <div ref={statsRef} className="bio-reveal grid grid-cols-2 gap-4 md:grid-cols-4">
                            {stats.map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="stat-item group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-slate-900/60 hover:shadow-[0_10px_40px_rgba(6,182,212,0.1)]"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 transition-all duration-300 group-hover:from-cyan-500/5 group-hover:to-transparent"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="mb-2 text-3xl font-bold text-white transition-colors group-hover:text-cyan-400">
                                            {stat.value}
                                        </div>
                                        <div className="font-mono text-xs tracking-wider text-slate-500 uppercase">
                                            {stat.label}
                                        </div>
                                    </div>
                                    
                                    {/* Corner Icon */}
                                    <div className="absolute -right-2 -bottom-2 text-4xl text-white/5 transition-all duration-300 group-hover:text-cyan-500/10">
                                        {stat.icon || <ThunderboltOutlined />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="bio-reveal flex flex-wrap gap-4 pt-4">
                            <a
                                href="#experience"
                                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500 px-8 py-4 font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40"
                            >
                                {/* Shine Effect */}
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                                <span className="relative">View My Journey</span>
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

            {/* CSS for Float Animation */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </section>
    );
}