// ==================== sections/Footer.jsx ====================
import { GithubOutlined, LinkedinOutlined, TwitterOutlined } from '@ant-design/icons';
import { memo } from 'react';

function Footer({ profile }) {
    const socials = [
        { icon: <GithubOutlined />, url: profile.social?.github },
        { icon: <LinkedinOutlined />, url: profile.social?.linkedin },
        { icon: <TwitterOutlined />, url: profile.social?.twitter },
    ];

    return (
        <footer className="relative z-10 border-t border-white/5 bg-[#020617]/80 py-12 text-center backdrop-blur-sm">
            <div className="mb-8 flex justify-center gap-6">
                {socials.map((s, i) => (
                    <a key={i} href={s.url || '#'} target="_blank" rel="noopener noreferrer"
                        className="text-2xl text-slate-500 transition-colors hover:text-cyan-400">{s.icon}</a>
                ))}
            </div>
            <div className="font-mono text-xs text-slate-600">&copy; {new Date().getFullYear()} {profile.name}. All rights reserved.</div>
        </footer>
    );
}
export default memo(Footer);
