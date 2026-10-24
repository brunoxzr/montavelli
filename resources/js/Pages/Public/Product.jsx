import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import ProductImage from '../../Components/ProductImage';
import ProductCard from '../../Components/ProductCard';
import Icon from '../../Components/Icon';
import { toast } from '../../Components/Toast';
import { add as addToBag } from '../../lib/bag';
import { aspect, formatPrice, postJson } from '../../lib/format';

function Accordion({ title, children, defaultOpen = false }) {
    if (!children) return null;
    return (
        <details className="group border-b border-line" open={defaultOpen}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between">
                <span className="eyebrow">{title}</span>
                <Icon name="plus" className="text-lg transition-transform group-open:rotate-45" />
            </summary>
            <div className="pb-5 text-sm leading-relaxed text-ink/80">{children}</div>
        </details>
    );
}

function Lightbox({ images, start, onClose }) {
    const ref = useRef(null);
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        ref.current?.scrollTo({ left: start * ref.current.clientWidth });
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
    }, [start, onClose]);

    return (
        <div className="animate-fade fixed inset-0 z-[60] bg-paper" role="dialog" aria-modal="true" aria-label="Imagens ampliadas">
            <button onClick={onClose} className="absolute right-2 top-2 z-10 flex h-12 w-12 items-center justify-center bg-paper/80 text-2xl" aria-label="Fechar"><Icon name="close" /></button>
            <div ref={ref} className="scrollbar-none flex h-full snap-x snap-mandatory overflow-x-auto">
                {images.map((img) => (
                    <div key={img.id} className="flex h-full w-full shrink-0 snap-center items-center justify-center overflow-auto">
                        {/* imagem de zoom em alta: arraste/pinça para ver detalhes */}
                        <img src={img.zoom} alt={img.alt} className="max-h-full w-auto max-w-none md:max-w-full" style={{ touchAction: 'pinch-zoom' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function Gallery({ images, name }) {
    const { site } = usePage().props;
    const ref = useRef(null);
    const [index, setIndex] = useState(0);
    const [zoom, setZoom] = useState(null);

    const go = (i) => {
        setIndex(i);
        ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' });
    };

    if (images.length === 0) return <ProductImage image={null} alt={name} />;

    return (
        <div className="md:flex md:gap-4">
            {images.length > 1 && (
                <div className="order-first hidden w-20 shrink-0 flex-col gap-3 md:flex">
                    {images.map((img, i) => (
                        <button key={img.id} onClick={() => go(i)} aria-label={`Ver imagem ${i + 1}`} aria-current={i === index}
                            className={`overflow-hidden transition-opacity ${i === index ? 'opacity-100 ring-1 ring-ink' : 'opacity-50 hover:opacity-100'}`}>
                            <img src={img.thumb} alt="" loading="lazy" className="w-full object-cover" style={{ aspectRatio: aspect(site.image_ratio) }} />
                        </button>
                    ))}
                </div>
            )}
            <div className="relative min-w-0 flex-1">
                <div
                    ref={ref}
                    onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
                    className="scrollbar-none -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0"
                >
                    {images.map((img, i) => (
                        <button key={img.id} onClick={() => setZoom(i)} className="w-full shrink-0 snap-center cursor-zoom-in" aria-label={`Ampliar imagem ${i + 1}`}>
                            <ProductImage image={img} alt={name} eager={i === 0} sizes="(min-width: 768px) 50vw, 100vw" />
                        </button>
                    ))}
                </div>
                <span className="pointer-events-none absolute bottom-3 right-3 hidden h-10 w-10 items-center justify-center rounded-full bg-paper/90 text-lg md:flex"><Icon name="zoom" /></span>
                {images.length > 1 && (
                    <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
                        {images.map((img, i) => <span key={img.id} className={`h-[2px] transition-all ${i === index ? 'w-5 bg-ink' : 'w-2.5 bg-ink/30'}`} />)}
                    </div>
                )}
            </div>
            {zoom !== null && <Lightbox images={images} start={zoom} onClose={() => setZoom(null)} />}
        </div>
    );
}

export default function Product({ product, related, whatsappEnabled }) {
    const { site } = usePage().props;
    const [size, setSize] = useState(null);
    const [color, setColor] = useState(null);
    const [busy, setBusy] = useState(false);
    const [tried, setTried] = useState(false);

    const sizes = useMemo(() => [...new Set(product.variants.map((v) => v.size).filter(Boolean))], [product]);
    const colors = useMemo(() => [...new Map(product.variants.filter((v) => v.color).map((v) => [v.color, v.hex])).entries()], [product]);

    const available = (s, c) => product.variants.length === 0 || product.variants.some((v) => (!s || v.size === s) && (!c || v.color === c) && v.available);
    const allOut = product.variants.length > 0 && !product.variants.some((v) => v.available);
    const soldOut = product.sold_out || allOut;

    const price = formatPrice(product.price, site);
    const sale = formatPrice(product.sale_price, site);
    const missing = [sizes.length > 0 && !size && 'tamanho', colors.length > 0 && !color && 'cor'].filter(Boolean);

    const guard = () => {
        if (missing.length) {
            setTried(true);
            toast(`Selecione ${missing.join(' e ')}`, 'error');
            return false;
        }
        return true;
    };

    const order = async () => {
        if (!guard()) return;
        setBusy(true);
        // abre a aba já no clique (evita bloqueio de pop-up no iOS)
        const win = window.open('', '_blank');
        try {
            const { url } = await postJson(`/produtos/${product.slug}/whatsapp`, { tamanho: size ?? '', cor: color ?? '' });
            if (win) win.location.href = url;
            else window.location.href = url;
        } catch {
            win?.close();
            toast('Não foi possível abrir o WhatsApp. Tente novamente.', 'error');
        } finally {
            setBusy(false);
        }
    };

    const addBag = () => {
        if (!guard()) return;
        addToBag({ id: product.id, slug: product.slug, name: product.name, price: product.sale_price ?? product.price, image: product.images[0]?.thumb ?? null, size, color, qty: 1 });
        toast('Adicionado à sacola');
    };

    const share = async () => {
        const data = { title: product.name, url: window.location.href };
        if (navigator.share) await navigator.share(data).catch(() => {});
        else {
            await navigator.clipboard?.writeText(data.url);
            toast('Link copiado');
        }
    };

    const Actions = ({ compact = false }) =>
        soldOut ? (
            <p className="btn w-full cursor-default border-line bg-soft text-muted">Esgotado</p>
        ) : (
            <div className={`flex gap-2 ${compact ? '' : 'flex-col'}`}>
                {whatsappEnabled && (
                    <button className="btn btn-solid flex-1" disabled={busy} onClick={order}>
                        <Icon name="whatsapp" className="text-lg" />
                        {site.whatsapp_button_label}
                    </button>
                )}
                <button className={`btn btn-outline ${compact ? 'w-12 shrink-0 !px-0' : 'flex-1'}`} onClick={addBag} aria-label="Adicionar à sacola">
                    <Icon name="bag" className="text-lg" />
                    {!compact && 'Adicionar à sacola'}
                </button>
            </div>
        );

    return (
        <>
            <Head title={product.name} />

            <div className="container-page">
                <nav className="eyebrow flex items-center gap-2 py-4 !text-[10px] text-muted" aria-label="Você está em">
                    <Link href="/" className="hover:text-ink">Início</Link>
                    <Icon name="chevron-right" />
                    {product.category ? (
                        <Link href={`/produtos?categoria=${product.category_slug}`} className="hover:text-ink">{product.category}</Link>
                    ) : (
                        <Link href="/produtos" className="hover:text-ink">Produtos</Link>
                    )}
                </nav>
            </div>

            <article className="container-page grid gap-8 pb-10 md:grid-cols-[1.15fr_1fr] md:gap-12 lg:gap-16">
                <Gallery images={product.images} name={product.name} />

                <div className="md:sticky md:top-28 md:self-start">
                    {product.category && <p className="eyebrow text-muted">{product.category}</p>}
                    <h1 className="mt-2 text-[34px] leading-[1.1] sm:text-5xl">{product.name}</h1>

                    {price && (
                        <p className="mt-4 flex items-baseline gap-3 text-xl">
                            {sale ? (<><span className="font-medium">{sale}</span><span className="text-base text-muted line-through">{price}</span></>) : price}
                        </p>
                    )}

                    {product.description && <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-ink/80">{product.description}</p>}

                    {colors.length > 0 && (
                        <fieldset className="mt-8">
                            <legend className="label">Cor {color && <span className="ml-1 font-normal normal-case tracking-normal text-muted">{color}</span>}</legend>
                            <div className="flex flex-wrap gap-3">
                                {colors.map(([name, hex]) => {
                                    const ok = available(size, name);
                                    return (
                                        <button key={name} disabled={!ok} onClick={() => setColor(color === name ? null : name)} aria-label={`${name}${ok ? '' : ' (indisponível)'}`} aria-pressed={color === name}
                                            className={`relative flex h-11 w-11 items-center justify-center rounded-full transition ${color === name ? 'ring-1 ring-ink ring-offset-2' : ''} disabled:cursor-not-allowed disabled:opacity-30`}>
                                            <span className="block h-9 w-9 rounded-full border border-line" style={{ background: hex }} />
                                            {!ok && <span className="absolute h-px w-10 rotate-45 bg-ink" />}
                                        </button>
                                    );
                                })}
                            </div>
                            {tried && !color && <p className="mt-2 text-xs text-red-700">Selecione uma cor</p>}
                        </fieldset>
                    )}

                    {sizes.length > 0 && (
                        <fieldset className="mt-6">
                            <div className="flex items-center justify-between">
                                <legend className="label">Tamanho</legend>
                                {product.measurement_table && (
                                    <a href="#medidas" className="mb-2 flex items-center gap-1 text-xs underline underline-offset-4"><Icon name="ruler" /> Tabela de medidas</a>
                                )}
                            </div>
                            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                                {sizes.map((s) => {
                                    const ok = available(s, color);
                                    return (
                                        <button key={s} disabled={!ok} onClick={() => setSize(size === s ? null : s)} aria-pressed={size === s}
                                            className={`btn btn-sm !px-0 !tracking-normal ${size === s ? 'btn-solid' : 'btn-outline border-line hover:border-ink hover:bg-transparent hover:text-ink'} disabled:line-through`}>
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                            {tried && !size && <p className="mt-2 text-xs text-red-700">Selecione um tamanho</p>}
                        </fieldset>
                    )}

                    <div className="mt-8 hidden md:block"><Actions /></div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted">
                        {product.sku ? <span>Ref. {product.sku}</span> : <span />}
                        <button onClick={share} className="flex min-h-11 items-center gap-1.5 uppercase tracking-[0.14em] hover:text-ink"><Icon name="share" className="text-sm" /> Compartilhar</button>
                    </div>

                    {(site.trust_badges || []).filter((b) => b.active).length > 0 && (
                        <ul className="mt-6 space-y-3 border-y border-line py-5">
                            {site.trust_badges.filter((b) => b.active).map((b, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm"><Icon name={b.icon} className="text-lg text-ink/70" />{b.text}</li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-2">
                        <Accordion title="Composição">{product.composition && <p className="whitespace-pre-line">{product.composition}</p>}</Accordion>
                        <Accordion title="Cuidados">{product.care && <p className="whitespace-pre-line">{product.care}</p>}</Accordion>
                        <Accordion title="Medidas" defaultOpen={false}>
                            {(product.measurements_note || product.measurement_table) && (
                                <div id="medidas">
                                    {product.measurements_note && <p className="mb-4 whitespace-pre-line">{product.measurements_note}</p>}
                                    {product.measurement_table?.content?.columns && (
                                        <div className="-mx-4 overflow-x-auto px-4">
                                            <table className="w-full min-w-max text-left text-[13px]">
                                                <caption className="sr-only">{product.measurement_table.name}</caption>
                                                <thead>
                                                    <tr className="border-b border-ink">
                                                        <th className="py-2 pr-4 font-medium">Tam.</th>
                                                        {product.measurement_table.content.columns.map((c) => <th key={c} className="py-2 pr-4 font-medium">{c}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(product.measurement_table.content.rows ?? []).map((r) => (
                                                        <tr key={r.label} className="border-b border-line">
                                                            <th className="py-2.5 pr-4 font-medium">{r.label}</th>
                                                            {r.values.map((v, i) => <td key={i} className="py-2.5 pr-4">{v}</td>)}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Accordion>
                        <Accordion title="Observações">{product.notes && <p className="whitespace-pre-line">{product.notes}</p>}</Accordion>
                    </div>
                </div>
            </article>

            {/* CTA fixo no rodapé (mobile) */}
            <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pt-3 backdrop-blur md:hidden">
                <Actions compact />
            </div>

            {related.length > 0 && (
                <section className="container-page mt-10 border-t border-line pt-16">
                    <div className="mb-8 text-center">
                        <p className="eyebrow text-muted">Da mesma categoria</p>
                        <h2 className="mt-2 text-3xl sm:text-4xl">Você também pode gostar</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6">
                        {related.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}
            <div className="h-20 md:hidden" />
        </>
    );
}
