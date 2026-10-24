import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import PublicLayout from './Layouts/PublicLayout';
import AdminLayout from './Layouts/AdminLayout';

// Páginas que não usam layout (tela cheia)
const BARE = ['Admin/Login', 'Admin/ForgotPassword', 'Admin/ResetPassword', 'Public/Links', 'Public/Maintenance'];

createInertiaApp({
    title: (title) => title || 'MONTAVELLI',
    resolve: async (name) => {
        // cada página vira um arquivo separado (a loja não baixa o código do admin)
        const pages = import.meta.glob('./Pages/**/*.jsx');
        const loader = pages[`./Pages/${name}.jsx`];
        if (!loader) throw new Error(`Página não encontrada: ${name}`);
        const page = await loader();
        page.default.layout ??= BARE.includes(name)
            ? (p) => p
            : name.startsWith('Admin/')
              ? (p) => <AdminLayout>{p}</AdminLayout>
              : (p) => <PublicLayout>{p}</PublicLayout>;
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#CCC2B4', showSpinner: false },
});
