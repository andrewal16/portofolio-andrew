// ============================================================================
// 🏆 CERTIFICATES SECTION WITH TAB FILTER (LEARNING/COMPETITION) & PAGINATION
// Add this to your Portfolio Index.jsx
// ============================================================================

import {
    BookOutlined,
    CloseOutlined,
    DownloadOutlined,
    FileOutlined,
    LoadingOutlined,
    SafetyCertificateOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { message, Modal } from 'antd';
import { useState } from 'react';

function CertificatesSection({ initialCertificates, onPreview }) {
    const [certificates, setCertificates] = useState(
        initialCertificates.data || [],
    );
    const [nextPageUrl, setNextPageUrl] = useState(
        initialCertificates.next_page_url,
    );
    const [activeCategory, setActiveCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [previewCert, setPreviewCert] = useState(null);

    // ✅ Category tabs
    const categoryTabs = [
        {
            key: 'all',
            label: 'All Certificates',
            icon: <SafetyCertificateOutlined />,
        },
        { key: 'learning', label: 'Learning', icon: <BookOutlined /> },
        { key: 'competition', label: 'Competition', icon: <TrophyOutlined /> },
    ];

    // ✅ Handle category change
    const handleCategoryChange = async (category) => {
        setActiveCategory(category);
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            if (category !== 'all') params.append('category', category);
            params.append('per_page', '6');

            const res = await fetch(
                `/api/portfolio/certificates?${params.toString()}`,
                {
                    headers: { Accept: 'application/json' },
                },
            );

            if (res.ok) {
                const data = await res.json();
                setCertificates(data.data || []);
                setNextPageUrl(data.next_page_url);
            }
        } catch (err) {
            message.error('Failed to load certificates');
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
                setCertificates((prev) => [...prev, ...(data.data || [])]);
                setNextPageUrl(data.next_page_url);
            }
        } catch (err) {
            message.error('Failed to load more certificates');
        } finally {
            setIsLoadingMore(false);
        }
    };

    // ✅ PDF helpers
    const isPDF = (url) => url && url.toLowerCase().endsWith('.pdf');

    const getPDFThumbnail = (pdfUrl) => {
        if (!pdfUrl || !pdfUrl.includes('cloudinary.com')) return null;
        const urlParts = pdfUrl.split('/upload/');
        if (urlParts.length === 2) {
            return (
                urlParts[0] +
                '/upload/pg_1,w_600,h_400,c_fill,f_jpg,q_auto/' +
                urlParts[1]
            );
        }
        return null;
    };

    const getCertThumbnail = (cert) => {
        return cert.is_pdf ? getPDFThumbnail(cert.image) : cert.image;
    };

    const handleDownloadPDF = (url, filename) => {
        if (url.includes('cloudinary.com')) {
            const urlParts = url.split('/upload/');
            if (urlParts.length === 2) {
                window.open(
                    urlParts[0] + '/upload/fl_attachment/' + urlParts[1],
                    '_blank',
                );
                message.success('Download started!');
                return;
            }
        }
        window.open(url, '_blank');
    };

    return (
        <>
            <section className="relative z-10 border-y border-white/5 bg-[#0a0f1e]/80 px-6 py-32 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="reveal-section mb-12 flex items-center gap-4">
                        <span className="block font-mono text-2xl font-bold tracking-widest text-indigo-500">
                            03 / Certifications
                        </span>
                        <div className="h-[1px] flex-grow bg-slate-800"></div>
                    </div>

                    {/* ✅ TAB FILTER BUTTONS */}
                    <div className="reveal-section mb-12 flex flex-wrap justify-center gap-3">
                        {categoryTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleCategoryChange(tab.key)}
                                disabled={isLoading}
                                className={`group relative flex items-center gap-2 rounded-full border px-6 py-3 font-mono text-sm transition-all duration-300 ${
                                    activeCategory === tab.key
                                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                        : 'border-white/10 text-slate-400 hover:border-indigo-500/50 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span
                                    className={`transition-colors ${
                                        activeCategory === tab.key
                                            ? 'text-indigo-400'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    {tab.icon}
                                </span>
                                <span>{tab.label}</span>
                                {/* Special badge for competition */}
                                {tab.key === 'competition' && (
                                    <span className="ml-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-400">
                                        🏆
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ✅ LOADING STATE */}
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <LoadingOutlined
                                    className="text-4xl text-indigo-500"
                                    spin
                                />
                                <span className="font-mono text-sm text-slate-500">
                                    Loading certificates...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ✅ CERTIFICATE GRID */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {certificates.map((cert) => {
                                    const thumbnail = getCertThumbnail(cert);
                                    return (
                                        <div
                                            key={cert.id}
                                            onClick={() => setPreviewCert(cert)}
                                            className="reveal-section group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]"
                                        >
                                            {/* Background Image */}
                                            <div className="absolute inset-0 h-full w-full bg-slate-950">
                                                {thumbnail ? (
                                                    <img
                                                        src={thumbnail}
                                                        alt={cert.title}
                                                        className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-900/30 via-slate-900 to-slate-950">
                                                        <FileOutlined className="text-6xl text-indigo-400 opacity-40" />
                                                        <p className="mt-4 font-mono text-xs text-indigo-300/60">
                                                            {cert.is_pdf
                                                                ? 'PDF'
                                                                : 'IMAGE'}{' '}
                                                            CERTIFICATE
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent"></div>
                                            </div>

                                            {/* Content Overlay */}
                                            <div className="absolute bottom-0 left-0 z-20 w-full p-6">
                                                {/* Category & Type Badge */}
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {cert.category ===
                                                        'competition' ? (
                                                            <span className="flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 font-mono text-[10px] text-yellow-400">
                                                                <TrophyOutlined />{' '}
                                                                AWARD
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 font-mono text-[10px] text-indigo-300">
                                                                <BookOutlined />{' '}
                                                                COURSE
                                                            </span>
                                                        )}
                                                    </div>
                                                    {cert.is_pdf && (
                                                        <span className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-[10px] text-red-400">
                                                            PDF
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title & Issuer */}
                                                <h4 className="mb-1 line-clamp-2 text-lg font-bold text-white transition-colors group-hover:text-indigo-200">
                                                    {cert.title}
                                                </h4>
                                                <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                                                    <p className="font-mono text-xs text-slate-400 uppercase transition-colors group-hover:text-white">
                                                        {cert.issuer}
                                                    </p>
                                                    <span className="font-mono text-[10px] text-slate-600 group-hover:text-indigo-400">
                                                        {cert.issued_date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ✅ EMPTY STATE */}
                            {certificates.length === 0 && (
                                <div className="py-16 text-center">
                                    <SafetyCertificateOutlined className="mb-4 text-5xl text-slate-700" />
                                    <p className="font-mono text-slate-500">
                                        No certificates found for this category.
                                    </p>
                                </div>
                            )}

                            {/* ✅ LOAD MORE BUTTON */}
                            {nextPageUrl && (
                                <div className="mt-12 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className="group relative inline-flex items-center gap-3 border border-indigo-500/30 px-8 py-3 font-mono text-sm tracking-widest text-indigo-400 uppercase transition-all hover:bg-indigo-500/10 disabled:opacity-50"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <LoadingOutlined spin />
                                                <span>Loading...</span>
                                            </>
                                        ) : (
                                            <span>Load More Certificates</span>
                                        )}
                                        <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-indigo-500"></span>
                                        <span className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-indigo-500"></span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* ✅ CERTIFICATE PREVIEW MODAL */}
            <Modal
                open={!!previewCert}
                onCancel={() => setPreviewCert(null)}
                footer={null}
                centered
                width={1000}
                closeIcon={<CloseOutlined className="text-white" />}
                styles={{
                    content: {
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        color: 'white',
                        padding: 0,
                    },
                    mask: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(2,6,23,0.8)',
                    },
                }}
            >
                {previewCert && (
                    <div className="relative">
                        {/* Header */}
                        <div className="border-b border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                            <div className="mb-2 flex items-center gap-2">
                                {previewCert.category === 'competition' ? (
                                    <TrophyOutlined className="text-yellow-400" />
                                ) : (
                                    <BookOutlined className="text-indigo-400" />
                                )}
                                <span
                                    className={`font-mono text-xs uppercase ${
                                        previewCert.category === 'competition'
                                            ? 'text-yellow-400'
                                            : 'text-indigo-400'
                                    }`}
                                >
                                    {previewCert.category_label}
                                </span>
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-white">
                                {previewCert.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="font-mono text-slate-400">
                                    <span className="text-slate-600">
                                        Issued by:
                                    </span>{' '}
                                    <span className="text-white">
                                        {previewCert.issuer}
                                    </span>
                                </span>
                                <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                                <span className="font-mono text-slate-400">
                                    <span className="text-slate-600">
                                        Date:
                                    </span>{' '}
                                    <span className="text-white">
                                        {previewCert.issued_date}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {previewCert.is_pdf ? (
                                <div className="space-y-4">
                                    <div className="relative h-[70vh] w-full overflow-hidden rounded-lg border border-white/10 bg-slate-950">
                                        <object
                                            data={previewCert.image}
                                            type="application/pdf"
                                            className="h-full w-full"
                                        >
                                            <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
                                                <FileOutlined className="text-4xl text-slate-500" />
                                                <p className="text-slate-400">
                                                    Browser doesn't support PDF
                                                    preview.
                                                </p>
                                                <button
                                                    onClick={() =>
                                                        handleDownloadPDF(
                                                            previewCert.image,
                                                            `${previewCert.title}.pdf`,
                                                        )
                                                    }
                                                    className="rounded-full bg-cyan-600 px-6 py-2 font-bold text-white hover:bg-cyan-500"
                                                >
                                                    Download PDF
                                                </button>
                                            </div>
                                        </object>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() =>
                                                handleDownloadPDF(
                                                    previewCert.image,
                                                    `${previewCert.title}.pdf`,
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 font-mono text-sm text-cyan-300 hover:bg-cyan-500/20"
                                        >
                                            <DownloadOutlined />
                                            Download
                                        </button>
                                        {previewCert.credential_url && (
                                            <a
                                                href={
                                                    previewCert.credential_url
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 font-mono text-sm text-indigo-300 hover:bg-indigo-500/20"
                                            >
                                                <SafetyCertificateOutlined />
                                                Verify
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-white/10 bg-black/50 p-2">
                                    <img
                                        src={previewCert.image}
                                        className="h-auto max-h-[70vh] w-full object-contain"
                                        alt="Certificate"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}

export { CertificatesSection };
