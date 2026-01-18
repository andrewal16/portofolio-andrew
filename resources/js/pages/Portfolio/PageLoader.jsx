// resources/js/components/PageLoader.jsx
import { router } from '@inertiajs/react';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

export default function PageLoader() {
    const [isNavigating, setIsNavigating] = useState(false);
    const [progress, setProgress] = useState(0);
    const loaderRef = useRef(null);
    const tlRef = useRef(null);

    useEffect(() => {
        // ✅ FIX: router.on() returns unsubscribe function
        const removeStartListener = router.on('start', (e) => {
            if (e.detail?.visit?.url?.hash) return;
            setIsNavigating(true);
            setProgress(0);
        });

        const removeProgressListener = router.on('progress', (e) => {
            if (e.detail?.progress?.percentage) {
                setProgress(e.detail.progress.percentage);
            }
        });

        const removeFinishListener = router.on('finish', () => {
            setTimeout(() => {
                setIsNavigating(false);
                setProgress(0);
            }, 400);
        });

        // ✅ FIX: Use returned functions to cleanup
        return () => {
            removeStartListener();
            removeProgressListener();
            removeFinishListener();
        };
    }, []);

    useEffect(() => {
        if (!loaderRef.current) return;

        if (isNavigating) {
            if (tlRef.current) tlRef.current.kill();

            gsap.set(loaderRef.current, {
                yPercent: 0,
                opacity: 1,
                display: 'block',
            });
            gsap.set('.loader-slice', { scaleY: 0 });
            gsap.set('.loader-particle', { scale: 0, opacity: 0 });
            gsap.set('.loader-text-char', { y: 50, opacity: 0 });
            gsap.set('.loader-progress-fill', { scaleX: 0 });
            gsap.set('.loader-grid-line', { scaleX: 0, scaleY: 0 });
            gsap.set('.loader-circle', { scale: 0, rotation: 0 });
            gsap.set('.loader-dot', { scale: 0 });

            tlRef.current = gsap.timeline();

            tlRef.current
                .to('.loader-slice', {
                    scaleY: 1,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: 'power4.out',
                })
                .to(
                    '.loader-grid-line-h',
                    {
                        scaleX: 1,
                        duration: 0.6,
                        stagger: 0.08,
                        ease: 'power2.out',
                    },
                    '-=0.2',
                )
                .to(
                    '.loader-grid-line-v',
                    {
                        scaleY: 1,
                        duration: 0.6,
                        stagger: 0.08,
                        ease: 'power2.out',
                    },
                    '-=0.5',
                )
                .to(
                    '.loader-circle',
                    {
                        scale: 1,
                        duration: 0.5,
                        ease: 'back.out(1.7)',
                    },
                    '-=0.4',
                )
                .to(
                    '.loader-circle',
                    {
                        rotation: 360,
                        duration: 2,
                        ease: 'none',
                        repeat: -1,
                    },
                    '-=0.3',
                )
                .to(
                    '.loader-dot',
                    {
                        scale: 1,
                        duration: 0.3,
                        stagger: { each: 0.1, repeat: -1, yoyo: true },
                        ease: 'power2.out',
                    },
                    '-=1.8',
                )
                .to(
                    '.loader-text-char',
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.4,
                        stagger: 0.03,
                        ease: 'power3.out',
                    },
                    '-=1.5',
                )
                .to(
                    '.loader-particle',
                    {
                        scale: 1,
                        opacity: 0.6,
                        duration: 0.5,
                        stagger: { each: 0.1, from: 'random' },
                        ease: 'power2.out',
                    },
                    '-=1.2',
                );

            gsap.to('.loader-particle', {
                y: 'random(-30, 30)',
                x: 'random(-20, 20)',
                duration: 'random(2, 4)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: { each: 0.2, from: 'random' },
            });
        } else {
            if (tlRef.current) tlRef.current.kill();

            gsap.timeline()
                .to('.loader-text-char', {
                    y: -30,
                    opacity: 0,
                    duration: 0.2,
                    stagger: 0.02,
                    ease: 'power2.in',
                })
                .to(
                    '.loader-particle',
                    {
                        scale: 2,
                        opacity: 0,
                        duration: 0.3,
                        stagger: { each: 0.05, from: 'random' },
                    },
                    '-=0.1',
                )
                .to(
                    '.loader-circle',
                    {
                        scale: 0,
                        duration: 0.3,
                        ease: 'power2.in',
                    },
                    '-=0.2',
                )
                .to(
                    '.loader-slice',
                    {
                        scaleY: 0,
                        duration: 0.4,
                        stagger: { each: 0.03, from: 'end' },
                        ease: 'power4.in',
                    },
                    '-=0.2',
                )
                .to(loaderRef.current, {
                    opacity: 0,
                    duration: 0.2,
                    onComplete: () => {
                        gsap.set(loaderRef.current, { display: 'none' });
                    },
                });
        }
    }, [isNavigating]);

    useEffect(() => {
        gsap.to('.loader-progress-fill', {
            scaleX: progress / 100,
            duration: 0.3,
            ease: 'power2.out',
        });
    }, [progress]);

    const loadingText = 'LOADING';
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
    }));

    return (
        <div
            ref={loaderRef}
            className="fixed inset-0 z-[200]"
            style={{ display: 'none' }}
        >
            {/* Sliced Background */}
            <div className="absolute inset-0 flex">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="loader-slice flex-1 origin-top"
                        style={{
                            background: `linear-gradient(180deg, 
                                #020617 0%, 
                                ${i % 2 === 0 ? '#0a1628' : '#061020'} 50%,
                                #020617 100%)`,
                        }}
                    />
                ))}
            </div>

            {/* Animated Grid */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={`h-${i}`}
                        className="loader-grid-line loader-grid-line-h absolute left-0 h-[1px] w-full origin-left"
                        style={{
                            top: `${(i + 1) * 14.28}%`,
                            background:
                                'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)',
                        }}
                    />
                ))}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={`v-${i}`}
                        className="loader-grid-line loader-grid-line-v absolute top-0 h-full w-[1px] origin-top"
                        style={{
                            left: `${(i + 1) * 11.11}%`,
                            background:
                                'linear-gradient(180deg, transparent, rgba(6,182,212,0.2), transparent)',
                        }}
                    />
                ))}
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="loader-particle absolute rounded-full"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            background:
                                p.id % 3 === 0
                                    ? 'rgba(6,182,212,0.8)'
                                    : p.id % 3 === 1
                                      ? 'rgba(99,102,241,0.8)'
                                      : 'rgba(168,85,247,0.8)',
                            boxShadow: `0 0 ${p.size * 2}px currentColor`,
                        }}
                    />
                ))}
            </div>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex flex-col items-center">
                    {/* Rotating Circle */}
                    <div className="loader-circle relative mb-8">
                        <svg width="80" height="80" viewBox="0 0 80 80">
                            <circle
                                cx="40"
                                cy="40"
                                r="35"
                                fill="none"
                                stroke="rgba(6,182,212,0.2)"
                                strokeWidth="2"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r="35"
                                fill="none"
                                stroke="url(#loaderGradient)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="60 160"
                            />
                            <defs>
                                <linearGradient
                                    id="loaderGradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                >
                                    <stop offset="0%" stopColor="#06B6D4" />
                                    <stop offset="50%" stopColor="#6366F1" />
                                    <stop offset="100%" stopColor="#A855F7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                        </div>
                    </div>

                    {/* Loading Text */}
                    <div className="flex items-center gap-1 font-mono text-2xl tracking-[0.3em]">
                        {loadingText.split('').map((char, i) => (
                            <span
                                key={i}
                                className="loader-text-char inline-block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent"
                            >
                                {char}
                            </span>
                        ))}
                    </div>

                    {/* Animated Dots */}
                    <div className="mt-4 flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="loader-dot h-2 w-2 rounded-full bg-cyan-500"
                                style={{
                                    boxShadow: '0 0 10px rgba(6,182,212,0.8)',
                                }}
                            />
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 w-48">
                        <div className="h-[2px] w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                                className="loader-progress-fill h-full origin-left rounded-full"
                                style={{
                                    background:
                                        'linear-gradient(90deg, #06B6D4, #6366F1, #A855F7)',
                                    boxShadow: '0 0 20px rgba(6,182,212,0.5)',
                                }}
                            />
                        </div>
                        <div className="mt-2 text-center font-mono text-xs text-slate-500">
                            {progress > 0
                                ? `${Math.round(progress)}%`
                                : 'Initializing...'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-6 left-6 h-16 w-16 border-t-2 border-l-2 border-cyan-500/30" />
            <div className="absolute top-6 right-6 h-16 w-16 border-t-2 border-r-2 border-cyan-500/30" />
            <div className="absolute bottom-6 left-6 h-16 w-16 border-b-2 border-l-2 border-cyan-500/30" />
            <div className="absolute right-6 bottom-6 h-16 w-16 border-r-2 border-b-2 border-cyan-500/30" />

            {/* Scan Line */}
            {isNavigating && (
                <div
                    className="absolute left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                    style={{ animation: 'scanLine 2s linear infinite' }}
                />
            )}

            <style>{`
                @keyframes scanLine {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
