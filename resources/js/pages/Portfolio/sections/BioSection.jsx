import {
    CodeOutlined,
    GlobalOutlined,
    ThunderboltOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { memo, useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_STATS = [
    { value: '3+', label: 'Years Exp', icon: <ThunderboltOutlined /> },
    { value: '20+', label: 'Projects', icon: <CodeOutlined /> },
    { value: '10+', label: 'Tech Stack', icon: <GlobalOutlined /> },
    { value: 'Top 1%', label: 'AI4Impact', icon: <TrophyOutlined /> },
];

function BioSection({ profile }) {
    const sectionRef = useRef(null);
    const statsRef = useRef(null);
    const stats = profile?.stats || DEFAULT_STATS;

    useEffect(() => {
        const ctx = gsap.context(() => {
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
            gsap.from('.stat-item', {
                scrollTrigger: { trigger: statsRef.current, start: 'top 85%' },
                scale: 0.8,
                opacity: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'back.out(1.7)',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative z-10 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#020617] via-[#0a101f] to-[#020617] px-6 py-32"
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
                <div className="absolute right-1/4 -bottom-20 h-[400px] w-[400px] rounded-full bg-green-500/5 blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="bio-reveal mb-16 text-center">
                    <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-5 py-2 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative h-2 w-2 rounded-full bg-cyan-500" />
                        </span>
                        <span className="font-mono text-sm text-cyan-400">
                            About Me
                        </span>
                    </div>
                </div>

                <div className="bio-reveal space-y-4 text-center">
                    <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-300">
                        {profile.bio}
                    </p>
                    {profile.bio_extended && (
                        <p className="mx-auto max-w-3xl leading-relaxed text-slate-400">
                            {profile.bio_extended}
                        </p>
                    )}
                </div>

                <div
                    ref={statsRef}
                    className="bio-reveal mt-12 grid grid-cols-2 gap-4 md:grid-cols-4"
                >
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="stat-item group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_10px_40px_rgba(6,182,212,0.1)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 transition-all duration-300 group-hover:from-cyan-500/5 group-hover:to-transparent" />
                            <div className="relative z-10">
                                <div className="mb-2 text-3xl font-bold text-white transition-colors group-hover:text-cyan-400">
                                    {stat.value}
                                </div>
                                <div className="font-mono text-xs tracking-wider text-slate-500 uppercase">
                                    {stat.label}
                                </div>
                            </div>
                            <div className="absolute -right-2 -bottom-2 text-4xl text-white/5 transition-all duration-300 group-hover:text-cyan-500/10">
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default memo(BioSection);
