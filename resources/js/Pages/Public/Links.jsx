import { Head, usePage } from '@inertiajs/react';
import Logo from '../../Components/Logo';
import Icon from '../../Components/Icon';
import { instagramHandle } from '../../lib/format';

/** Conteúdo da página de links (reutilizado na pré-visualização do admin). */
export function LinksView({ site, links, avatar, preview = false }) {
    const description = site.links_description || site.tagline || '';
    const lines = description.split('\n').filter(Boolean);
    const outline = site.links_button_style === 'outline';

    return (
        <div className="flex min-h-full flex-col items-center px-5 pb-10 pt-12 text-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-ink ring-1 ring-champagne/60 ring-offset-4 ring-offset-paper">
                {avatar ? (
                    <img src={avatar} alt={site.store_name} className="h-full w-full object-cover" />
                ) : (
                    <Logo variant="monogram" tone="champagne" className="h-14 w-auto" />
                )}
            </div>

            {site.links_title ? (
                <h1 className="mt-6 text-3xl">{site.links_title}</h1>
            ) : (
                <h1 className="mt-7"><span className="sr-only">{site.store_name}</span><Logo variant="wordmark" className="h-4 w-auto" /></h1>
            )}
            {site.instagram && <p className="mt-2 text-xs tracking-wide text-muted">@{instagramHandle(site.instagram)}</p>}

            {lines.length > 0 && (
                <div className="mt-5 space-y-1">
                    {lines.map((l, i) => <p key={i} className={i === 0 ? 'font-serif text-xl italic' : 'eyebrow !text-[9px] text-muted'}>{l}</p>)}
                </div>
            )}

            <div className="divider-ornament my-8 w-full text-champagne"><Icon name="crown" className="text-base" /></div>

            <ul className="w-full max-w-sm space-y-3">
                {links.length === 0 && <li className="py-6 text-sm text-muted">Em breve.</li>}
                {links.map((l) => {
                    const highlight = l.is_highlighted;
                    const cls = highlight ? 'btn-champagne' : outline ? 'btn-outline' : 'btn-solid';
                    const Tag = preview ? 'span' : 'a';
                    return (
                        <li key={l.id}>
                            <Tag
                                {...(preview ? {} : { href: `/links/ir/${l.id}`, rel: 'noopener' })}
                                className={`btn relative min-h-14 w-full !normal-case !tracking-[0.04em] !text-[14px] ${cls} ${highlight ? 'shadow-[0_6px_20px_-8px_rgba(0,0,0,0.35)]' : ''}`}
                            >
                                {l.icon && <Icon name={l.icon} className="absolute left-5 text-lg" />}
                                <span className="px-8">{l.title}</span>
                                {highlight && <Icon name="arrow-up-right" className="absolute right-5 text-base" />}
                            </Tag>
                        </li>
                    );
                })}
            </ul>

            <a href={preview ? undefined : '/'} className="mt-14 opacity-60 transition-opacity hover:opacity-100" aria-label="Ir para a loja">
                <Logo variant="monogram" className="h-7 w-auto" />
            </a>
        </div>
    );
}

export default function Links({ links, avatar }) {
    const { site } = usePage().props;
    return (
        <main className="min-h-screen bg-paper">
            <Head title={site.links_title || site.store_name} />
            <div className="mx-auto max-w-md">
                <LinksView site={site} links={links} avatar={avatar} />
            </div>
        </main>
    );
}
