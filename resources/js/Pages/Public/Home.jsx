import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ProductCard from '../../Components/ProductCard';
import EmptyState from '../../Components/EmptyState';
import SectionTitle from '../../Components/SectionTitle';
import Logo from '../../Components/Logo';
import Icon from '../../Components/Icon';
import { aspect } from '../../lib/format';

function Intro({ site }) {
    const lines = (site.tagline || '').split('\n').filter(Boolean);
    return (
        <section className="relative overflow-hidden bg-ink text-champagne">
            <div className="container-page flex min-h-[78svh] flex-col items-center justify-center py-20 text-center md:min-h-[72vh]">
                <h1 className="sr-only">{site.store_name}</h1>
                <Logo variant="full" tone="champagne" className="w-56 sm:w-72 md:w-80" />
                {lines.length > 0 && (
                    <div className="mt-10 space-y-2">
                        <p className="font-serif text-[26px] italic leading-tight text-paper sm:text-4xl">{lines[0]}</p>
                        {lines.slice(1).map((l, i) => (
                            <p key={i} className="eyebrow !text-[10px] text-champagne/80 sm:!text-[11px]">{l}</p>
                        ))}
                    </div>
                )}
                <Link href="/produtos" className="btn btn-ghost-light mt-10 min-w-56">
                    Ver coleção <Icon name="arrow-right" />
                </Link>
            </div>
        </section>
    );
}

function Banners({ banners }) {
    const ref = useRef(null);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (banners.length < 2) return;
        const t = setInterval(() => {
            const el = ref.current;
            if (!el || el.matches(':hover')) return;
            const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
            el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
        }, 6000);
        return () => clearInterval(t);
    }, [banners.length]);

    return (
        <section className="relative" aria-roledescription="carrossel" aria-label="Destaques">
            <div
                ref={ref}
                onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
                className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
            >
                {banners.map((b, i) => {
                    const content = (
                        <div className="relative w-full">
                            <picture>
                                {b.mobile && <source media="(max-width: 767px)" srcSet={b.mobile} />}
                                <source type="image/webp" srcSet={b.srcset} sizes="100vw" />
                                <img src={b.src} alt={b.alt || ''} loading={i === 0 ? 'eager' : 'lazy'} className={`w-full object-cover ${b.mobile ? 'aspect-[4/5] md:aspect-[16/9]' : 'aspect-[16/9]'} max-h-[85vh]`} />
                            </picture>
                            {(b.title || b.subtitle || b.button_label) && (
                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/60 via-ink/10 to-transparent">
                                    <div className="container-page pb-10 text-paper md:pb-16">
                                        {b.subtitle && <p className="eyebrow text-champagne">{b.subtitle}</p>}
                                        {b.title && <h2 className="mt-2 max-w-2xl text-4xl leading-[1.05] sm:text-6xl">{b.title}</h2>}
                                        {b.button_label && b.link_url && <span className="btn btn-champagne mt-6">{b.button_label}</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                    return (
                        <div key={b.id} className="w-full shrink-0 snap-start">
                            {b.link_url ? (b.link_url.startsWith('/') ? <Link href={b.link_url}>{content}</Link> : <a href={b.link_url}>{content}</a>) : content}
                        </div>
                    );
                })}
            </div>
            {banners.length > 1 && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                    {banners.map((b, i) => (
                        <button
                            key={b.id}
                            aria-label={`Ir para destaque ${i + 1}`}
                            onClick={() => ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' })}
                            className="flex h-8 w-8 items-center justify-center"
                        >
                            <span className={`block h-[2px] transition-all ${i === index ? 'w-6 bg-paper' : 'w-3 bg-paper/50'}`} />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}

function Badges({ badges }) {
    const active = (badges || []).filter((b) => b.active);
    if (active.length === 0) return null;
    return (
        <section className="border-b border-line">
            <div className={`container-page grid gap-px py-2 ${['grid-cols-1', 'grid-cols-2', 'grid-cols-2 md:grid-cols-3', 'grid-cols-2 md:grid-cols-4'][Math.min(4, active.length) - 1]}`}>
                {active.map((b, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 px-3 py-8 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-champagne text-xl">
                            <Icon name={b.icon} />
                        </span>
                        <p className="eyebrow !text-[10px] leading-relaxed">{b.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Categories({ categories, title }) {
    const { site } = usePage().props;
    if (categories.length === 0) return null;
    const withImages = categories.some((c) => c.image);

    return (
        <section className="container-page mt-16 md:mt-24">
            <SectionTitle eyebrow="Explore" title={title || 'Categorias'} />
            {withImages ? (
                <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-4">
                    {categories.map((c) => (
                        <Link key={c.id} href={`/produtos?categoria=${c.slug}`} className="group relative w-[62%] shrink-0 snap-start overflow-hidden sm:w-auto">
                            <div className="bg-soft" style={{ aspectRatio: aspect(site.image_ratio) }}>
                                {c.image && <img src={c.image} alt={c.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 pt-16">
                                <p className="font-serif text-2xl text-paper">{c.name}</p>
                                <p className="eyebrow mt-1 flex items-center gap-1 !text-[9px] text-champagne">Ver peças <Icon name="arrow-right" /></p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                    {categories.map((c) => (
                        <Link key={c.id} href={`/produtos?categoria=${c.slug}`} className="btn btn-outline btn-sm shrink-0">{c.name}</Link>
                    ))}
                </div>
            )}
        </section>
    );
}

function Grid({ products, eyebrow, title, href }) {
    if (products.length === 0) return null;
    return (
        <section className="container-page mt-16 md:mt-24">
            <SectionTitle eyebrow={eyebrow} title={title} href={href} />
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
                {products.map((p, i) => <ProductCard key={p.id} product={p} eager={i < 2} />)}
            </div>
        </section>
    );
}

export default function Home({ banners, categories, featured, latest }) {
    const { site } = usePage().props;
    const sections = (site.home_sections || []).filter((s) => s.active);
    const nothing = featured.length === 0 && latest.length === 0;

    const render = (s) => {
        switch (s.key) {
            case 'banners':
                return banners.length > 0 ? <Banners key="banners" banners={banners} /> : null;
            case 'intro':
                return <Intro key="intro" site={site} />;
            case 'badges':
                return <Badges key="badges" badges={site.trust_badges} />;
            case 'categories':
                return <Categories key="categories" categories={categories} title={s.title} />;
            case 'featured':
                return <Grid key="featured" products={featured} eyebrow="Seleção" title={s.title || 'Destaques'} href="/produtos" />;
            case 'latest':
                return <Grid key="latest" products={latest} eyebrow="Recém-chegados" title={s.title || 'Novidades'} href="/produtos" />;
            default:
                return null;
        }
    };

    return (
        <>
            {sections.map(render)}
            {nothing && (
                <section className="container-page mt-16">
                    <EmptyState title="A coleção chega em breve">As peças aparecerão aqui assim que forem publicadas.</EmptyState>
                </section>
            )}
        </>
    );
}
