import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Icon from '../../Components/Icon';
import EmptyState from '../../Components/EmptyState';
import { toast } from '../../Components/Toast';
import { keyOf, useBag } from '../../lib/bag';
import { aspect, formatPrice, postJson } from '../../lib/format';

export default function Bag() {
    const { site } = usePage().props;
    const { items, count, setQty, remove, clear } = useBag();
    const [busy, setBusy] = useState(false);
    const hasWhatsapp = Boolean((site.whatsapp_number || '').replace(/\D/g, ''));
    const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.qty, 0);

    const send = async () => {
        setBusy(true);
        const win = window.open('', '_blank');
        try {
            const { url } = await postJson('/sacola/whatsapp', {
                items: items.map((i) => ({ id: i.id, size: i.size, color: i.color, qty: i.qty })),
            });
            if (win) win.location.href = url;
            else window.location.href = url;
        } catch {
            win?.close();
            toast('Não foi possível montar o pedido. Algum item pode ter saído de catálogo.', 'error');
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <Head title="Sacola" />
            <section className="container-page max-w-3xl py-10 md:py-14">
                <div className="text-center">
                    <p className="eyebrow text-muted">Seu pedido</p>
                    <h1 className="mt-2 text-4xl md:text-5xl">Sacola</h1>
                </div>

                {items.length === 0 ? (
                    <div className="mt-10">
                        <EmptyState icon="bag" title="Sua sacola está vazia" action={<Link href="/produtos" className="btn btn-solid">Explorar produtos</Link>}>
                            Adicione peças e envie tudo em um único pedido pelo WhatsApp.
                        </EmptyState>
                    </div>
                ) : (
                    <>
                        <ul className="mt-10 divide-y divide-line border-y border-line">
                            {items.map((i) => {
                                const key = keyOf(i);
                                return (
                                    <li key={key} className="flex gap-4 py-5">
                                        <Link href={`/produtos/${i.slug}`} className="w-20 shrink-0 bg-soft sm:w-24" style={{ aspectRatio: aspect(site.image_ratio) }}>
                                            {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
                                        </Link>
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <div className="flex items-start justify-between gap-3">
                                                <Link href={`/produtos/${i.slug}`} className="font-serif text-lg leading-snug">{i.name}</Link>
                                                <button onClick={() => remove(key)} className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center text-lg text-muted hover:text-ink" aria-label={`Remover ${i.name}`}>
                                                    <Icon name="delete" />
                                                </button>
                                            </div>
                                            <p className="mt-1 text-xs text-muted">{[i.size && `Tamanho ${i.size}`, i.color].filter(Boolean).join(' · ')}</p>
                                            <div className="mt-auto flex items-center justify-between pt-3">
                                                <div className="flex items-center border border-line">
                                                    <button onClick={() => setQty(key, i.qty - 1)} disabled={i.qty <= 1} className="flex h-10 w-10 items-center justify-center disabled:opacity-30" aria-label="Diminuir"><Icon name="minus" /></button>
                                                    <span className="w-8 text-center text-sm" aria-live="polite">{i.qty}</span>
                                                    <button onClick={() => setQty(key, i.qty + 1)} className="flex h-10 w-10 items-center justify-center" aria-label="Aumentar"><Icon name="plus" /></button>
                                                </div>
                                                {i.price && <p className="text-sm">{formatPrice(i.price * i.qty, site)}</p>}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="mt-6 flex items-baseline justify-between">
                            <p className="eyebrow">{count} {count === 1 ? 'item' : 'itens'}</p>
                            {total > 0 && <p className="font-serif text-2xl">{formatPrice(total, site)}</p>}
                        </div>
                        <p className="mt-2 text-xs text-muted">Valores de referência. O pedido é confirmado no atendimento pelo WhatsApp.</p>

                        <div className="mt-8 space-y-3">
                            {hasWhatsapp ? (
                                <button onClick={send} disabled={busy} className="btn btn-solid w-full">
                                    <Icon name="whatsapp" className="text-lg" /> Enviar pedido pelo WhatsApp
                                </button>
                            ) : (
                                <p className="bg-soft p-4 text-center text-sm text-muted">O atendimento por WhatsApp ainda não está disponível.</p>
                            )}
                            <div className="flex gap-3">
                                <Link href="/produtos" className="btn btn-outline flex-1">Continuar comprando</Link>
                                <button onClick={clear} className="btn btn-outline border-line text-muted">Esvaziar</button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </>
    );
}
