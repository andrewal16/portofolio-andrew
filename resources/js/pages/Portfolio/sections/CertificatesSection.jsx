import { BookOutlined, CloseOutlined, DownloadOutlined, FileOutlined, LoadingOutlined, SafetyCertificateOutlined, TrophyOutlined } from '@ant-design/icons';
import { Modal, message } from 'antd';
import { memo, useState } from 'react';

const CERT_TABS = [
    { key: 'all', label: 'All', icon: <SafetyCertificateOutlined /> },
    { key: 'learning', label: 'Learning', icon: <BookOutlined /> },
    { key: 'competition', label: 'Competition', icon: <TrophyOutlined /> },
];

const isPDF = (url) => url && url.toLowerCase().endsWith('.pdf');
const getPDFThumb = (url) => {
    if (!url?.includes('cloudinary.com')) return null;
    const parts = url.split('/upload/');
    return parts.length === 2 ? `${parts[0]}/upload/pg_1,w_600,h_400,c_fill,f_jpg,q_auto/${parts[1]}` : null;
};
const getThumb = (cert) => cert.is_pdf ? getPDFThumb(cert.image) : cert.image;

function CertificatesSection({ initialCertificates }) {
    const [certs, setCerts] = useState(initialCertificates.data || []);
    const [nextPage, setNextPage] = useState(initialCertificates.next_page_url);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [preview, setPreview] = useState(null);
    const [pdfError, setPdfError] = useState(false);

    const handleTabChange = async (cat) => {
        setActiveTab(cat);
        setLoading(true);
        try {
            const params = new URLSearchParams({ per_page: '6' });
            if (cat !== 'all') params.append('category', cat);
            const res = await fetch(`/api/portfolio/certificates?${params}`, { headers: { Accept: 'application/json' } });
            if (res.ok) { const d = await res.json(); setCerts(d.data || []); setNextPage(d.next_page_url); }
        } catch { message.error('Failed to load certificates'); }
        finally { setLoading(false); }
    };

    const handleLoadMore = async () => {
        if (!nextPage || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetch(nextPage, { headers: { Accept: 'application/json' } });
            if (res.ok) { const d = await res.json(); setCerts(p => [...p, ...(d.data || [])]); setNextPage(d.next_page_url); }
        } catch { message.error('Failed to load more'); }
        finally { setLoadingMore(false); }
    };

    return (
        <>
            <section className="relative z-10 border-y border-white/5 bg-[#0a0f1e]/80 px-6 py-32 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal-on-scroll mb-12 flex items-center gap-4">
                        <span className="block font-mono text-2xl font-bold tracking-widest text-indigo-500">03 / Certifications</span>
                        <div className="h-[1px] flex-grow bg-slate-800" />
                    </div>

                    <div className="reveal-on-scroll mb-12 flex flex-wrap justify-center gap-3">
                        {CERT_TABS.map((tab) => (
                            <button key={tab.key} onClick={() => handleTabChange(tab.key)} disabled={loading}
                                className={`flex items-center gap-2 rounded-full border px-6 py-3 font-mono text-sm transition-all duration-300 ${activeTab === tab.key ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-white/10 text-slate-400 hover:border-indigo-500/50 hover:text-white'}`}>
                                {tab.icon} <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex h-64 items-center justify-center"><LoadingOutlined className="text-4xl text-indigo-500" spin /></div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {certs.map((cert) => (
                                    <div key={cert.id} onClick={() => { setPreview(cert); setPdfError(false); }}
                                        className="cert-card group cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-slate-900/30 transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                                        <div className="relative h-48 overflow-hidden">
                                            {getThumb(cert) ? (
                                                <img src={getThumb(cert)} alt={cert.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-slate-800"><FileOutlined className="text-4xl text-slate-600" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent" />
                                        </div>
                                        <div className="p-6">
                                            <div className="mb-3 flex items-center gap-2">
                                                {cert.category === 'competition' ? (
                                                    <span className="flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 font-mono text-[10px] text-yellow-400"><TrophyOutlined /> AWARD</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 font-mono text-[10px] text-indigo-300"><BookOutlined /> COURSE</span>
                                                )}
                                                {cert.is_pdf && <span className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-[10px] text-red-400">PDF</span>}
                                            </div>
                                            <h4 className="mb-1 line-clamp-2 text-lg font-bold text-white group-hover:text-indigo-200">{cert.title}</h4>
                                            <p className="font-mono text-xs text-slate-400 uppercase">{cert.issuer}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {certs.length === 0 && (
                                <div className="py-16 text-center"><SafetyCertificateOutlined className="mb-4 text-5xl text-slate-700" /><p className="font-mono text-slate-500">No certificates found.</p></div>
                            )}

                            {nextPage && (
                                <div className="mt-12 text-center">
                                    <button onClick={handleLoadMore} disabled={loadingMore}
                                        className="inline-flex items-center gap-3 border border-indigo-500/30 px-8 py-3 font-mono text-sm text-indigo-400 uppercase transition-all hover:bg-indigo-500/10 disabled:opacity-50">
                                        {loadingMore ? <><LoadingOutlined spin /> Loading...</> : 'Load More Certificates'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Modal — scoped di dalam komponen ini, bukan di parent */}
            <Modal open={!!preview} onCancel={() => setPreview(null)} footer={null} centered width={1000}
                closeIcon={<CloseOutlined className="text-white" />}
                styles={{ content: { backgroundColor: '#0f172a', border: '1px solid #1e293b', color: 'white', padding: 0 }, mask: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(2,6,23,0.8)' } }}>
                {preview && (
                    <div className="p-6">
                        <h3 className="mb-4 text-xl font-bold text-white">{preview.title}</h3>
                        <p className="mb-4 font-mono text-sm text-slate-400">{preview.issuer}</p>
                        {preview.is_pdf && !pdfError ? (
                            <iframe src={preview.image} className="h-[500px] w-full rounded-lg border border-white/10" onError={() => setPdfError(true)} />
                        ) : getThumb(preview) ? (
                            <img src={getThumb(preview)} alt={preview.title} className="w-full rounded-lg" />
                        ) : null}
                        {preview.is_pdf && (
                            <button onClick={() => window.open(preview.image, '_blank')}
                                className="mt-4 flex items-center gap-2 rounded border border-indigo-500/30 px-4 py-2 font-mono text-sm text-indigo-400 hover:bg-indigo-500/10">
                                <DownloadOutlined /> Download PDF
                            </button>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}

export default memo(CertificatesSection);
