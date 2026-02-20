// ==================== sections/ContactSection.jsx ====================
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { useForm } from '@inertiajs/react';
import { message } from 'antd';
import { memo, useEffect, useRef } from 'react';

function ContactSection({ flash }) {
    const sectionRef = useRef(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', email: '', phone: '', message: '',
    });

    useEffect(() => {
        if (flash?.success && sectionRef.current) {
            setTimeout(() => sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
        }
    }, [flash?.success]);

    const handleSubmit = () => {
        post(route('contact.send'), {
            onSuccess: () => { reset(); message.success('Message sent!'); },
            onError: () => message.error('Please check your inputs.'),
        });
    };

    return (
        <section id="contact" ref={sectionRef} className="relative z-10 border-t border-white/5 bg-[#020617]/80 px-6 py-24 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl">
                <div className="reveal-on-scroll mb-16 text-center">
                    <span className="font-mono text-sm tracking-widest text-cyan-500">05 / Contact</span>
                    <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl">Let's Work Together</h2>
                    <p className="mx-auto mt-4 max-w-xl text-slate-400">Have a project in mind? Drop me a message.</p>
                </div>
                <div className="reveal-on-scroll space-y-8 rounded-2xl border border-white/5 bg-slate-900/30 p-8 backdrop-blur-sm md:p-12">
                    {flash?.success && (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
                            <p className="font-bold text-green-400">Message Sent Successfully</p>
                            <p className="font-mono text-sm text-green-300">{flash.success}</p>
                        </div>
                    )}
                    <div className="grid gap-6 md:grid-cols-2">
                        {['name', 'email'].map((field) => (
                            <div key={field}>
                                <label className="mb-2 block font-mono text-xs tracking-widest text-slate-500 uppercase">{field}</label>
                                <input type={field === 'email' ? 'email' : 'text'} value={data[field]} onChange={(e) => setData(field, e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white outline-none transition-all focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                    placeholder={field === 'email' ? 'your@email.com' : 'Your name'} />
                                {errors[field] && <p className="mt-1 font-mono text-xs text-red-400">{errors[field]}</p>}
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="mb-2 block font-mono text-xs tracking-widest text-slate-500 uppercase">Message</label>
                        <textarea value={data.message} onChange={(e) => setData('message', e.target.value)} rows={5}
                            className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white outline-none transition-all focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                            placeholder="Tell me about your project..." />
                        {errors.message && <p className="mt-1 font-mono text-xs text-red-400">{errors.message}</p>}
                    </div>
                    <button onClick={handleSubmit} disabled={processing}
                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-cyan-600 py-4 font-bold text-white transition-all hover:bg-cyan-500 disabled:opacity-50">
                        {processing ? <><LoadingOutlined spin /> Sending...</> : <><SendOutlined /> Send Message</>}
                    </button>
                </div>
            </div>
        </section>
    );
}
export default memo(ContactSection);
