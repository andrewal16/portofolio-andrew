import {
    AppstoreOutlined,
    ArrowRightOutlined,
    CodeOutlined,
    DatabaseOutlined,
    LoadingOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { Link } from '@inertiajs/react';
import { message } from 'antd';
import { memo, useState } from 'react';

const TYPE_ICONS = {
    'Web App': <CodeOutlined />,
    'Data Science': <DatabaseOutlined />,
    AI: <RocketOutlined />,
    Mobile: <AppstoreOutlined />,
};

function ProjectsSection({ initialProjects, projectTypes }) {
    const [projects, setProjects] = useState(initialProjects.data || []);
    const [nextPage, setNextPage] = useState(initialProjects.next_page_url);
    const [activeType, setActiveType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const tabs = [
        { key: 'all', label: 'All Projects', icon: <AppstoreOutlined /> },
        ...(projectTypes || []).map((t) => ({
            key: t,
            label: t,
            icon: TYPE_ICONS[t] || <CodeOutlined />,
        })),
    ];

    const handleTypeChange = async (type) => {
        setActiveType(type);
        setLoading(true);
        try {
            const params = new URLSearchParams({ per_page: '6' });
            if (type !== 'all') params.append('type', type);
            const res = await fetch(`/api/portfolio/projects?${params}`, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(data.data || []);
                setNextPage(data.next_page_url);
            }
        } catch {
            message.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (!nextPage || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetch(nextPage, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                setProjects((prev) => [...prev, ...(data.data || [])]);
                setNextPage(data.next_page_url);
            }
        } catch {
            message.error('Failed to load more projects');
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <section id="projects" className="relative z-10 px-6 py-32">
            <div className="mx-auto max-w-7xl">
                <div className="reveal-on-scroll mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
                    <div>
                        <span className="mb-4 block font-mono text-2xl font-bold tracking-widest text-cyan-500">
                            02 / Portfolio
                        </span>
                        <h2 className="text-5xl font-bold text-white">
                            Selected Works
                        </h2>
                    </div>
                    <div className="h-[1px] flex-grow bg-slate-800 md:mx-8" />
                </div>

                {/* Tabs */}
                <div className="reveal-on-scroll mb-12 flex flex-wrap justify-center gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTypeChange(tab.key)}
                            disabled={loading}
                            className={`group relative flex items-center gap-2 rounded-full border px-6 py-3 font-mono text-sm transition-all duration-300 ${activeType === tab.key ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-white/10 text-slate-400 hover:border-cyan-500/50 hover:bg-white/5 hover:text-white'}`}
                        >
                            <span
                                className={
                                    activeType === tab.key
                                        ? 'text-cyan-400'
                                        : 'text-slate-500'
                                }
                            >
                                {tab.icon}
                            </span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <LoadingOutlined
                            className="text-4xl text-cyan-500"
                            spin
                        />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((p, idx) => (
                                <Link
                                    href={route(
                                        'portfolio.project.show',
                                        p.slug,
                                    )}
                                    key={`${p.id}-${idx}`}
                                    className="project-card group relative flex h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                                >
                                    <div className="relative h-[55%] overflow-hidden">
                                        <div className="absolute inset-0 z-10 bg-slate-900/20 transition-colors group-hover:bg-slate-900/0" />
                                        <img
                                            src={p.image}
                                            alt={p.title}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                        />
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-xs text-cyan-400 backdrop-blur-md">
                                                {p.type || 'Project'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative z-20 flex h-[45%] flex-col bg-gradient-to-b from-[#0f172a] to-[#020617] p-6">
                                        <div className="mb-2 flex items-start justify-between">
                                            <h3 className="text-xl font-bold text-white transition-colors group-hover:text-cyan-400">
                                                {p.title}
                                            </h3>
                                            <ArrowRightOutlined className="-translate-x-4 text-slate-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                                        </div>
                                        <p className="mb-4 line-clamp-2 font-['Inter'] text-sm text-slate-400">
                                            {p.description}
                                        </p>
                                        <div className="mt-auto flex flex-wrap gap-2">
                                            {(p.technologies || [])
                                                .slice(0, 4)
                                                .map((tech, i) => (
                                                    <span
                                                        key={i}
                                                        className="rounded border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 font-mono text-[10px] text-cyan-300"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {projects.length === 0 && (
                            <div className="py-16 text-center font-mono text-slate-500">
                                No projects found.
                            </div>
                        )}

                        {nextPage && (
                            <div className="mt-12 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="group relative inline-flex items-center gap-3 border border-cyan-500/30 px-8 py-3 font-mono text-sm tracking-widest text-cyan-400 uppercase transition-all hover:bg-cyan-500/10 disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <>
                                            <LoadingOutlined spin /> Loading...
                                        </>
                                    ) : (
                                        'Load More Projects'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default memo(ProjectsSection);
