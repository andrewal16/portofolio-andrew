import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { memo, useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

function ExperienceTimeline({ experiences }) {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.utils.toArray('.exp-card').forEach((card) => {
                gsap.from(card, {
                    scrollTrigger: { trigger: card, start: 'top 85%' },
                    y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
                });
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    if (!experiences?.length) return null;

    return (
        <section id="experience" ref={sectionRef} className="relative z-10 border-b border-white/5 bg-[#020617]/90 px-6 py-32 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl">
                <div className="reveal-on-scroll mb-16 flex items-center gap-4">
                    <span className="block font-mono text-2xl font-bold tracking-widest text-green-500">01 / Experience</span>
                    <div className="h-[1px] flex-grow bg-slate-800" />
                </div>

                <div className="relative">
                    <div className="absolute top-0 bottom-0 left-8 w-[2px] bg-gradient-to-b from-green-500/50 via-cyan-500/30 to-transparent md:left-12" />
                    <div className="space-y-12">
                        {experiences.map((exp) => (
                            <Link
                                href={route('portfolio.experience.show', exp.slug)}
                                key={exp.id}
                                className="exp-card group relative block"
                            >
                                <div className="absolute top-8 left-8 z-20 flex h-4 w-4 -translate-x-1/2 items-center justify-center md:left-12">
                                    <span className="absolute h-full w-full animate-ping rounded-full bg-green-500 opacity-75 group-hover:bg-cyan-500" />
                                    <span className={`relative h-3 w-3 rounded-full ${exp.is_current ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`} />
                                </div>
                                <div className="ml-16 rounded-xl border border-white/5 bg-slate-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-green-500/30 hover:bg-slate-900/60 md:ml-24">
                                    <div className="mb-2 flex flex-wrap items-center gap-3">
                                        {exp.company_logo && (
                                            <img src={exp.company_logo} alt={exp.company_name} className="h-8 w-8 rounded-full object-cover" loading="lazy" />
                                        )}
                                        <h3 className="text-lg font-bold text-white group-hover:text-green-400">{exp.position}</h3>
                                    </div>
                                    <p className="mb-1 font-mono text-sm text-slate-400">{exp.company_name}</p>
                                    <p className="font-mono text-xs text-slate-600">{exp.formatted_duration}</p>
                                    {exp.description && <p className="mt-3 line-clamp-2 text-sm text-slate-400">{exp.description}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default memo(ExperienceTimeline);
