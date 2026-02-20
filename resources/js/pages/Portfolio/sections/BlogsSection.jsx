// ==================== sections/BlogsSection.jsx ====================
import { ArrowRightOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from '@inertiajs/react';
import { memo } from 'react';

function BlogsSection({ blogs }) {
    if (!blogs?.length) return null;
    return (
        <section id="insights" className="relative z-10 px-6 py-32">
            <div className="mx-auto max-w-7xl">
                <div className="reveal-on-scroll mb-16">
                    <span className="mb-2 block font-mono text-2xl font-bold tracking-widest text-pink-500">
                        04 / Blog
                    </span>
                    <h2 className="text-5xl font-bold text-white">
                        Recent Articles
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {blogs.map((blog) => (
                        <Link
                            href={route('portfolio.blog.show', blog.slug)}
                            key={blog.id}
                            className="group rounded-2xl border border-white/5 bg-slate-900/30 p-6 transition-all duration-300 hover:border-pink-500/30 hover:bg-slate-900/60"
                        >
                            <div className="mb-4 flex items-center gap-2 font-mono text-xs text-slate-500">
                                <CalendarOutlined /> {blog.published_at}
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-white group-hover:text-pink-400">
                                {blog.title}
                            </h3>
                            <p className="mb-4 line-clamp-3 text-sm text-slate-400">
                                {blog.excerpt}
                            </p>
                            <span className="flex items-center text-sm font-bold text-white">
                                Read Article{' '}
                                <ArrowRightOutlined className="ml-2 text-pink-500 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
export default memo(BlogsSection);
