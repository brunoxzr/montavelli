import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Logo from '../Components/Logo';
import Icon from '../Components/Icon';
import Toast from '../Components/Toast';
import { useBag } from '../lib/bag';
import { instagramHandle, instagramUrl, whatsappUrl } from '../lib/format';

function AnnouncementBar({ badges }) {
    const active = (badges || []).filter((b) => b.active);
    if (active.length === 0) return null;
    return (
        <div className="bg-ink text-champagne">
            <div className="container-page flex h-9 items-center justify-center gap-8 overflow-hidden">
                {active.map((b, i) => (
                    <p key={i} className={`eyebrow flex items-center gap-2 !text-[10px] ${i > 0 ? 'hidden md:flex' : ''}`}>
                        <Icon name={b.icon} className="text-[13px]" />
                        {b.text}
                    </p>
                ))}
            </div>
        </div>
    );
}

function MenuDrawer({ open, onClose, nav, site }) {
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => (document.body.style.overflow = '');
    }, [open]);

    if (!open) return null;
    const insta = instagramUrl(site.instagram);
    const wa = whatsappUrl(site.whatsapp_number);

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
            <button className="animate-fade absolute inset-0 bg-ink/40" onClick={onClose} aria-label="Fechar menu" />
            <aside className="animate-left absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-paper">
                <div className="flex h-16 items-center justify-between border-b border-line px-5">
                    <Logo variant="wordmark" className="h-3.5 w-auto" />
                    <button onClick={onClose} className="-mr-2 flex h-12 w-12 items-center justify-center text-2xl" aria-label="Fechar">
                        <Icon name="close" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-5 py-4">
                    <Link href="/" onClick={onClose} className="flex min-h-14 items-center border-b border-line/60 font-serif text-2xl">Início</Link>
                    <Link href="/produtos" onClick={onClose} className="flex min-h-14 items-center justify-between border-b border-line/60 font-serif text-2xl">
                        Todos os produtos <Icon name="chevron-right" className="text-lg text-muted" />
                    </Link>
                    {nav?.categories?.map((c) => (
                        <Link key={c.id} href={`/produtos?categoria=${c.slug}`} onClick={onClose} className="flex min-h-14 items-center justify-between border-b border-line/60 font-serif text-2xl">
                            {c.name} <Icon name="chevron-right" className="text-lg text-muted" />
                        </Link>
                    ))}
                    {nav?.pages?.length > 0 && (
                        <div className="mt-8 space-y-1">
                            {nav.pages.map((p) => (
                                <Link key={p.slug} href={`/${p.slug}`} onClick={onClose} className="flex min-h-11 items-center text-sm text-muted">{p.title}</Link>
                            ))}
                        </div>
                    )}
                </nav>
                <div className="flex gap-3 border-t border-line p-5">
                    {insta && (
                        <a href={insta} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm flex-1">
                            <Icon name="instagram" className="text-base" /> Instagram
                        </a>
                    )}
                    {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm flex-1">
                            <Icon name="whatsapp" className="text-base" /> WhatsApp
                        </a>
                    )}
                </div>
            </aside>
        </div>
    );
}

function SearchOverlay({ open, onClose }) {
    const [q, setQ] = useState('');
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-paper/98 animate-fade" role="dialog" aria-modal="true" aria-label="Buscar">
            <div className="container-page flex h-16 items-center justify-end">
                <button onClick={onClose} className="flex h-12 w-12 items-center justify-center text-2xl" aria-label="Fechar busca"><Icon name="close" /></button>
            </div>
            <form
                className="container-page max-w-2xl pt-10"
                onSubmit={(e) => {
                    e.preventDefault();
                    onClose();
                    router.get('/produtos', q ? { q } : {});
                }}
                role="search"
            >
                <label htmlFor="busca-global" className="eyebrow text-muted">O que você procura?</label>
                <div className="mt-4 flex items-center border-b border-ink">
                    <input id="busca-global" autoFocus value={q} onChange={(e) => setQ(e.target.value)} className="min-h-16 flex-1 bg-transparent font-serif text-3xl outline-none placeholder:text-ink/25" placeholder="Buscar peças" />
                    <button className="flex h-12 w-12 items-center justify-center text-2xl" aria-label="Buscar"><Icon name="arrow-right" /></button>
                </div>
            </form>
        </div>
    );
}

export default function PublicLayout({ children }) {
    const { site, nav } = usePage().props;
    const { count } = useBag();
    const [menu, setMenu] = useState(false);
    const [search, setSearch] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const insta = instagramUrl(site.instagram);
    const wa = whatsappUrl(site.whatsapp_number);
    const lines = (site.tagline || '').split('\n').filter(Boolean);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => router.on('navigate', () => { setMenu(false); setSearch(false); }), []);

    return (
        <div className="flex min-h-screen flex-col">
            <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-paper focus:px-4 focus:py-2">Pular para o conteúdo</a>
            <AnnouncementBar badges={site.trust_badges} />

            <header className={`sticky top-0 z-40 bg-paper/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-[0_1px_0_var(--brand-line)]' : ''}`}>
                <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
                    <div className="flex items-center gap-1">
                        <button onClick={() => setMenu(true)} className="-ml-3 flex h-12 w-12 items-center justify-center text-[22px] lg:hidden" aria-label="Abrir menu">
                            <Icon name="menu" />
                        </button>
                        <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
                            <Link href="/produtos" className="eyebrow py-3 transition-opacity hover:opacity-60">Produtos</Link>
                            {nav?.categories?.slice(0, 4).map((c) => (
                                <Link key={c.id} href={`/produtos?categoria=${c.slug}`} className="eyebrow py-3 transition-opacity hover:opacity-60">{c.name}</Link>
                            ))}
                        </nav>
                    </div>

                    <Link href="/" aria-label={`${site.store_name} - início`} className="flex flex-col items-center gap-1.5 py-2">
                        <Logo variant="monogram" className="hidden h-7 w-auto md:block" />
                        <Logo variant="wordmark" className="h-3.5 w-auto md:h-4" />
                    </Link>

                    <div className="flex items-center justify-end">
                        <button onClick={() => setSearch(true)} className="flex h-12 w-12 items-center justify-center text-[21px]" aria-label="Buscar">
                            <Icon name="search" />
                        </button>
                        <Link href="/sacola" className="relative -mr-3 flex h-12 w-12 items-center justify-center text-[21px]" aria-label={`Sacola, ${count} ${count === 1 ? 'item' : 'itens'}`}>
                            <Icon name="bag" />
                            {count > 0 && (
                                <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-paper">{count}</span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <main id="conteudo" className="flex-1">{children}</main>

            <footer className="mt-20 bg-ink text-paper/80 md:mt-28">
                <div className="container-page py-16 text-center md:py-20">
                    <Link href="/" aria-label="Início" className="inline-block">
                        <Logo variant="full" tone="champagne" className="mx-auto w-44 md:w-52" />
                    </Link>
                    {lines.length > 0 && (
                        <div className="mx-auto mt-8 max-w-md space-y-1 font-serif text-lg italic text-champagne/90">
                            {lines.slice(0, 2).map((l, i) => <p key={i}>{l}</p>)}
                        </div>
                    )}
                    {site.footer_text && <p className="mx-auto mt-6 max-w-lg whitespace-pre-line text-sm leading-relaxed text-paper/60">{site.footer_text}</p>}

                    {(insta || wa) && (
                        <div className="mt-10 flex justify-center gap-3">
                            {insta && (
                                <a href={insta} target="_blank" rel="noopener noreferrer" aria-label={`Instagram @${instagramHandle(site.instagram)}`} className="flex h-12 w-12 items-center justify-center rounded-full border border-champagne/40 text-xl text-champagne transition-colors hover:bg-champagne hover:text-ink">
                                    <Icon name="instagram" />
                                </a>
                            )}
                            {wa && (
                                <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-12 w-12 items-center justify-center rounded-full border border-champagne/40 text-xl text-champagne transition-colors hover:bg-champagne hover:text-ink">
                                    <Icon name="whatsapp" />
                                </a>
                            )}
                            {site.contact_email && (
                                <a href={`mailto:${site.contact_email}`} aria-label="E-mail" className="flex h-12 w-12 items-center justify-center rounded-full border border-champagne/40 text-xl text-champagne transition-colors hover:bg-champagne hover:text-ink">
                                    <Icon name="mail" />
                                </a>
                            )}
                        </div>
                    )}

                    {nav?.pages?.length > 0 && (
                        <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-1">
                            {nav.pages.map((p) => (
                                <li key={p.slug}>
                                    <Link href={`/${p.slug}`} className="eyebrow inline-flex min-h-11 items-center !text-[10px] text-paper/60 hover:text-champagne">{p.title}</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="border-t border-paper/10">
                    <p className="container-page eyebrow py-6 text-center !text-[9px] text-paper/40">
                        © {new Date().getFullYear()} {site.store_name}
                        {insta && <> · @{instagramHandle(site.instagram)}</>}
                    </p>
                </div>
            </footer>

            <MenuDrawer open={menu} onClose={() => setMenu(false)} nav={nav} site={site} />
            <SearchOverlay open={search} onClose={() => setSearch(false)} />
            <Toast />
        </div>
    );
}
