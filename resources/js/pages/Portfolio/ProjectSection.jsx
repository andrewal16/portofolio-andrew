// ============================================================================
// PORTFOLIO INDEX - PROJECTS & CERTIFICATES SECTION ONLY
// Add this to your existing Index.jsx, replacing the old sections
// ============================================================================

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
import { useState } from 'react';

// ============================================================================
// 🎯 PROJECTS SECTION WITH TAB FILTER & PAGINATION
// ============================================================================

function ProjectsSection({ initialProjects, projectTypes }) {
    const [projects, setProjects] = useState(initialProjects.data || []);
    const [nextPageUrl, setNextPageUrl] = useState(
        initialProjects.next_page_url,
    );
    const [activeType, setActiveType] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // ✅ Tab type icon mapping
    const typeIcons = {
        'Web App': <CodeOutlined />,
        'Data Science': <DatabaseOutlined />,
        AI: <RocketOutlined />,
        Mobile: <AppstoreOutlined />,
    };

    // ✅ Handle tab change
    const handleTypeChange = async (type) => {
        setActiveType(type);
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            if (type !== 'all') params.append('type', type);
            params.append('per_page', '6');

            const res = await fetch(
                `/api/portfolio/projects?${params.toString()}`,
                {
                    headers: { Accept: 'application/json' },
                },
            );

            if (res.ok) {
                const data = await res.json();
                setProjects(data.data || []);
                setNextPageUrl(data.next_page_url);
            }
        } catch (err) {
            message.error('Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Handle load more
    const handleLoadMore = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);

        try {
            const res = await fetch(nextPageUrl, {
                headers: { Accept: 'application/json' },
            });

            if (res.ok) {
                const data = await res.json();
                setProjects((prev) => [...prev, ...(data.data || [])]);
                setNextPageUrl(data.next_page_url);
            }
        } catch (err) {
            message.error('Failed to load more projects');
        } finally {
            setIsLoadingMore(false);
        }
    };

    // ✅ All tabs including "All"
    const tabs = [
        { key: 'all', label: 'All Projects', icon: <AppstoreOutlined /> },
        ...projectTypes.map((type) => ({
            key: type,
            label: type,
            icon: typeIcons[type] || <CodeOutlined />,
        })),
    ];

    return (
        <section id="projects" className="relative z-10 px-6 py-32">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="reveal-section mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
                    <div>
                        <span className="mb-4 block font-mono text-2xl font-bold tracking-widest text-cyan-500">
                            02 / Portfolio
                        </span>
                        <h2 className="text-5xl font-bold text-white">
                            Selected Works
                        </h2>
                    </div>
                    <div className="h-[1px] flex-grow bg-slate-800 md:mx-8"></div>
                </div>

                {/* ✅ TAB FILTER BUTTONS */}
                <div className="reveal-section mb-12 flex flex-wrap justify-center gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTypeChange(tab.key)}
                            disabled={isLoading}
                            className={`group relative flex items-center gap-2 rounded-full border px-6 py-3 font-mono text-sm transition-all duration-300 ${
                                activeType === tab.key
                                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                    : 'border-white/10 text-slate-400 hover:border-cyan-500/50 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <span
                                className={`transition-colors ${
                                    activeType === tab.key
                                        ? 'text-cyan-400'
                                        : 'text-slate-500'
                                }`}
                            >
                                {tab.icon}
                            </span>
                            <span>{tab.label}</span>
                            {activeType === tab.key && (
                                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-400"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ✅ LOADING STATE */}
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <LoadingOutlined
                                className="text-4xl text-cyan-500"
                                spin
                            />
                            <span className="font-mono text-sm text-slate-500">
                                Loading projects...
                            </span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ✅ PROJECT GRID */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project, idx) => (
                                <Link
                                    href={route(
                                        'portfolio.project.show',
                                        project.slug,
                                    )}
                                    key={`${project.id}-${idx}`}
                                    className="project-card group relative block flex h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                                >
                                    {/* Image */}
                                    <div className="relative h-[55%] overflow-hidden">
                                        <div className="absolute inset-0 z-10 bg-slate-900/20 transition-colors group-hover:bg-slate-900/0"></div>
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                        />
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-xs text-cyan-400 backdrop-blur-md">
                                                {project.type || 'Project'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-20 flex h-[45%] flex-col bg-gradient-to-b from-[#0f172a] to-[#020617] p-6">
                                        <div className="mb-2 flex items-start justify-between">
                                            <h3 className="text-xl font-bold text-white transition-colors group-hover:text-cyan-400">
                                                {project.title}
                                            </h3>
                                            <ArrowRightOutlined className="-translate-x-4 text-slate-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                                        </div>
                                        <p className="mb-4 line-clamp-2 font-['Inter'] text-sm text-slate-400">
                                            {project.description}
                                        </p>
                                        <div className="mt-auto flex flex-wrap gap-2">
                                            {project.technologies
                                                ?.slice(0, 3)
                                                .map((t, i) => (
                                                    <span
                                                        key={i}
                                                        className="rounded bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-500 uppercase"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            {project.technologies?.length >
                                                3 && (
                                                <span className="rounded bg-white/5 px-2 py-1 text-[10px] text-slate-600">
                                                    +
                                                    {project.technologies
                                                        .length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* ✅ EMPTY STATE */}
                        {projects.length === 0 && (
                            <div className="py-16 text-center">
                                <CodeOutlined className="mb-4 text-5xl text-slate-700" />
                                <p className="font-mono text-slate-500">
                                    No projects found for this category.
                                </p>
                            </div>
                        )}

                        {/* ✅ LOAD MORE BUTTON */}
                        {nextPageUrl && (
                            <div className="mt-16 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="group relative inline-flex items-center gap-3 border border-cyan-500/30 px-8 py-3 font-mono text-sm tracking-widest text-cyan-400 uppercase transition-all hover:bg-cyan-500/10 disabled:opacity-50"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <LoadingOutlined spin />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <span>Load More Projects</span>
                                    )}
                                    <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-cyan-500"></span>
                                    <span className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-cyan-500"></span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

// ✅ Export for use in main Index.jsx
export { ProjectsSection };
