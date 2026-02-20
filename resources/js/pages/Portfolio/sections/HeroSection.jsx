import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { memo, useCallback, useEffect, useRef } from 'react';

gsap.registerPlugin(TextPlugin);

const ROLES = ['Web Developer', 'Data Scientist', 'Creative Coder'];

function HeroSection({ profile, splashDone }) {
    const sectionRef = useRef(null);
    const textRef = useRef(null);
    const cursorRef = useRef(null);
    const animatedRef = useRef(false);

    // Typewriter — hanya jalan setelah splash selesai
    const startTypewriter = useCallback(() => {
        if (!textRef.current) return;
        const masterTl = gsap.timeline({ repeat: -1 });
        ROLES.forEach((role) => {
            const tl = gsap.timeline({
                repeat: 1,
                yoyo: true,
                repeatDelay: 1.5,
            });
            tl.to(textRef.current, {
                duration: role.length * 0.1,
                text: role,
                ease: 'none',
            });
            masterTl.add(tl);
        });
    }, []);

    // Hero entry animation — hanya dipanggil sekali setelah splash
    useEffect(() => {
        if (!splashDone || animatedRef.current) return;
        animatedRef.current = true;

        const ctx = gsap.context(() => {
            gsap.from('.hero-element', {
                y: 50,
                opacity: 0,
                stagger: 0.1,
                duration: 1,
                ease: 'power3.out',
            });
            gsap.from('.hero-avatar', {
                scale: 0.8,
                opacity: 0,
                rotation: -5,
                duration: 1.2,
                ease: 'back.out(1.7)',
            });
        }, sectionRef);

        startTypewriter();
        return () => ctx.revert();
    }, [splashDone, startTypewriter]);

    // Cursor blink
    useEffect(() => {
        if (!cursorRef.current) return;
        const tween = gsap.to(cursorRef.current, {
            opacity: 0,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true,
            duration: 0.5,
        });
        return () => tween.kill();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-20"
        >
            <div className="grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
                <div className="order-2 space-y-6 lg:order-1">
                    <div className="hero-element inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 font-mono text-xs text-cyan-400">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative h-2 w-2 rounded-full bg-cyan-500" />
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
                            <span ref={textRef} />
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
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }
                            className="rounded-full bg-cyan-600 px-8 py-3 font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 hover:bg-cyan-500"
                        >
                            View Experience
                        </button>
                        <a
                            href="#"
                            className="flex items-center gap-2 rounded-full border border-slate-700 px-8 py-3 text-slate-300 hover:border-white hover:text-white"
                        >
                            Resume
                        </a>
                    </div>
                </div>
                <div className="relative order-1 flex justify-center lg:order-2 lg:justify-end">
                    <div className="hero-avatar relative h-72 w-72 md:h-96 md:w-96">
                        <div className="absolute inset-[-20px] animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-cyan-500/30" />
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
    );
}

export default memo(HeroSection);
