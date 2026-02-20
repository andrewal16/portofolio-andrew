import { ThunderboltOutlined } from '@ant-design/icons';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { memo, useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const TECH_STACK = ['Laravel', 'React', 'Inertia', 'Tailwind', 'GSAP', 'Python', 'MySQL', 'AWS'];
const ITEMS = [...TECH_STACK, ...TECH_STACK, ...TECH_STACK, ...TECH_STACK];

function TechMarquee() {
    const marqueeRef = useRef(null);

    useEffect(() => {
        if (!marqueeRef.current) return;

        const tween = gsap.to(marqueeRef.current, {
            xPercent: -50,
            repeat: -1,
            duration: 25,
            ease: 'linear',
        });

        // 🔥 PAUSE saat di luar viewport → hemat CPU/GPU di mobile
        ScrollTrigger.create({
            trigger: marqueeRef.current,
            start: 'top bottom',
            end: 'bottom top',
            onEnter: () => tween.play(),
            onLeave: () => tween.pause(),
            onEnterBack: () => tween.play(),
            onLeaveBack: () => tween.pause(),
        });

        return () => {
            tween.kill();
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    return (
        <section className="relative z-10 overflow-hidden border-y border-white/5 bg-[#020617]/50 py-8 backdrop-blur-sm">
            <div className="flex whitespace-nowrap" ref={marqueeRef}>
                {ITEMS.map((t, i) => (
                    <div key={i} className="mx-8 flex items-center font-mono text-xl font-bold tracking-widest text-slate-500 uppercase opacity-70 transition-opacity hover:text-white hover:opacity-100">
                        <ThunderboltOutlined className="mr-2 text-cyan-500" />
                        {t}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default memo(TechMarquee);
