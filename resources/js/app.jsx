// resources/js/app.jsx (VERSI IMPROVED)
import { createInertiaApp } from '@inertiajs/react';
import 'antd/dist/reset.css';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { route } from 'ziggy-js';


import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import { Ziggy } from './ziggy';
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

window.Ziggy = Ziggy;
window.route = route;
createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`, // ✅ Tambah .jsx explicit
            import.meta.glob('./pages/**/*.jsx', { eager: false }), // ✅ Lebih specific
        ),

    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },

    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
