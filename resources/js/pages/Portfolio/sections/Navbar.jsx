import { memo } from 'react';

function Navbar({ profileName }) {
    return (
        <nav className="fixed z-50 flex w-full items-center justify-between border-b border-white/5 bg-[#020617]/70 px-6 py-6 backdrop-blur-md">
            <div className="text-xl font-bold tracking-widest text-white">
                {profileName?.split(' ')[0]}
                <span className="text-cyan-500">.DEV</span>
            </div>

            <a
                href="#contact"
                className="hidden rounded-full border border-cyan-500/50 px-6 py-2 font-mono text-sm text-cyan-400 transition-all hover:bg-cyan-500/10 md:block"
            >
                Contact
            </a>
        </nav>
    );
}

export default memo(Navbar);
