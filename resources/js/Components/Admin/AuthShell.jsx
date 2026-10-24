import { Head } from '@inertiajs/react';
import Logo from '../Logo';
import Toast from '../Toast';

/** Tela de autenticação: painel da marca (preto + champagne) e formulário em branco. */
export default function AuthShell({ title, subtitle, children }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <Head title={title} />
            <div className="flex items-center justify-center bg-ink px-6 py-14 lg:py-0">
                <Logo variant="full" tone="champagne" className="w-40 sm:w-48 lg:w-72" />
            </div>
            <div className="flex items-start justify-center bg-paper px-5 py-10 sm:items-center">
                <div className="w-full max-w-sm">
                    <p className="eyebrow text-muted">Painel administrativo</p>
                    <h1 className="mt-2 text-4xl">{title}</h1>
                    {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                </div>
            </div>
            <Toast />
        </div>
    );
}
