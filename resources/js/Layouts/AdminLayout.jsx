import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Logo from '../Components/Logo';
import Icon from '../Components/Icon';
import Toast from '../Components/Toast';

const NAV = [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard', exact: true },
    { section: 'Catálogo' },
    { label: 'Produtos', href: '/admin/produtos', icon: 'shirt' },
    { label: 'Categorias', href: '/admin/categorias', icon: 'folder' },
    { label: 'Tamanhos e cores', href: '/admin/atributos', icon: 'palette' },
    { label: 'Tabelas de medidas', href: '/admin/medidas', icon: 'ruler' },
    { section: 'Conteúdo' },
    { label: 'Links (bio)', href: '/admin/links', icon: 'links' },
    { label: 'Banners', href: '/admin/banners', icon: 'layout' },
    { label: 'Páginas', href: '/admin/paginas', icon: 'page' },
    { section: 'Sistema' },
    { label: 'Configurações', href: '/admin/configuracoes', icon: 'settings' },
    { label: 'Administradores', href: '/admin/usuarios', icon: 'users' },
];

function isActive(item, url) {
    const path = url.split('?')[0];
    return item.exact ? path === item.href : path === item.href || path.startsWith(item.href + '/');
}

function Nav({ url, onNavigate }) {
    return (
        <nav className="flex flex-col px-3 py-2" aria-label="Admin">
            {NAV.map((item, i) =>
                item.section ? (
                    <p key={i} className="mb-1 mt-6 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">{item.section}</p>
                ) : (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={isActive(item, url) ? 'page' : undefined}
                        className={`flex min-h-11 items-center gap-3 px-3 text-sm transition-colors ${isActive(item, url) ? 'bg-ink text-paper' : 'text-ink/80 hover:bg-soft hover:text-ink'}`}
                    >
                        <Icon name={item.icon} className={`text-lg ${isActive(item, url) ? 'text-champagne' : ''}`} />
                        {item.label}
                    </Link>
                ),
            )}
        </nav>
    );
}

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const url = usePage().url;
    const [open, setOpen] = useState(false);

    useEffect(() => router.on('navigate', () => setOpen(false)), []);
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
    }, [open]);

    const footer = (
        <div className="border-t border-line p-3">
            <Link href="/admin/conta" className="flex min-h-11 items-center gap-3 px-3 text-sm hover:bg-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-medium uppercase text-champagne">{auth.user?.name?.[0]}</span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate">{auth.user?.name}</span>
                    <span className="block truncate text-xs text-muted">Minha conta</span>
                </span>
            </Link>
            <div className="mt-1 grid grid-cols-2 gap-1">
                <a href="/" target="_blank" rel="noopener" className="flex min-h-11 items-center justify-center gap-2 text-xs uppercase tracking-[0.12em] text-muted hover:bg-soft hover:text-ink">
                    <Icon name="external" /> Ver loja
                </a>
                <button onClick={() => router.post('/admin/logout')} className="flex min-h-11 items-center justify-center gap-2 text-xs uppercase tracking-[0.12em] text-muted hover:bg-soft hover:text-ink">
                    <Icon name="logout" /> Sair
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-soft/60 lg:flex">
            {/* Sidebar desktop */}
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-paper lg:flex">
                <Link href="/admin" className="flex flex-col items-center gap-2 border-b border-line px-5 py-6">
                    <Logo variant="monogram" className="h-9 w-auto" />
                    <Logo variant="wordmark" className="h-2.5 w-auto" />
                </Link>
                <div className="flex-1 overflow-y-auto"><Nav url={url} /></div>
                {footer}
            </aside>

            {/* Topo mobile */}
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper px-2 lg:hidden">
                <button onClick={() => setOpen(true)} className="flex h-12 w-12 items-center justify-center text-[22px]" aria-label="Abrir menu"><Icon name="menu" /></button>
                <Link href="/admin" aria-label="Dashboard"><Logo variant="wordmark" className="h-3 w-auto" /></Link>
                <a href="/" target="_blank" rel="noopener" className="flex h-12 w-12 items-center justify-center text-xl" aria-label="Ver loja"><Icon name="external" /></a>
            </header>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
                    <button className="animate-fade absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-label="Fechar menu" />
                    <aside className="animate-left absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col bg-paper">
                        <div className="flex h-14 items-center justify-between border-b border-line px-4">
                            <Logo variant="wordmark" className="h-3 w-auto" />
                            <button onClick={() => setOpen(false)} className="-mr-2 flex h-12 w-12 items-center justify-center text-2xl" aria-label="Fechar"><Icon name="close" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto"><Nav url={url} onNavigate={() => setOpen(false)} /></div>
                        {footer}
                    </aside>
                </div>
            )}

            <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-10 lg:px-12">
                <div className="mx-auto max-w-6xl">{children}</div>
            </main>
            <Toast />
        </div>
    );
}
