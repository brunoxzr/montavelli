import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Badge, ConfirmButton, PageHeader, STATUS } from '../../../Components/Admin/ui';
import Icon from '../../../Components/Icon';
import { formatPrice } from '../../../lib/format';
import { usePage } from '@inertiajs/react';

export default function ProductsIndex({ products, filters, categories }) {
    const { site } = usePage().props;
    const [q, setQ] = useState(filters.q ?? '');
    const [selected, setSelected] = useState([]);
    const [category, setCategory] = useState('');

    const apply = (patch) => {
        const next = { ...filters, ...patch };
        Object.keys(next).forEach((k) => (next[k] === '' || next[k] == null) && delete next[k]);
        router.get('/admin/produtos', next, { preserveState: true, replace: true });
    };

    const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    const allIds = products.data.map((p) => p.id);
    const allSelected = selected.length > 0 && allIds.every((id) => selected.includes(id));

    const bulk = (action, extra = {}) =>
        router.post('/admin/produtos/massa', { ids: selected, action, ...extra }, { preserveScroll: true, onSuccess: () => setSelected([]) });

    return (
        <>
            <Head title="Produtos" />
            <PageHeader title="Produtos" subtitle={`${products.total} ${products.total === 1 ? 'produto' : 'produtos'}`}>
                <Link href="/admin/produtos/novo" className="btn btn-solid"><Icon name="plus" /> Novo produto</Link>
            </PageHeader>

            <div className="mb-4 grid gap-2 md:grid-cols-[1fr_200px_200px]">
                <form onSubmit={(e) => { e.preventDefault(); apply({ q }); }} className="relative" role="search">
                    <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="search" className="field !pl-11" placeholder="Buscar por nome ou SKU" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
                </form>
                <select className="field" value={filters.status ?? ''} onChange={(e) => apply({ status: e.target.value })} aria-label="Status">
                    <option value="">Todos os status</option>
                    {Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <select className="field" value={filters.category ?? ''} onChange={(e) => apply({ category: e.target.value })} aria-label="Categoria">
                    <option value="">Todas as categorias</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {selected.length > 0 && (
                <div className="sticky top-14 z-30 mb-3 flex flex-wrap items-center gap-2 bg-ink p-3 text-paper lg:top-0">
                    <span className="mr-2 text-sm">{selected.length} selecionado(s)</span>
                    <button className="btn btn-sm btn-ghost-light" onClick={() => bulk('active')}>Ativar</button>
                    <button className="btn btn-sm btn-ghost-light" onClick={() => bulk('draft')}>Desativar</button>
                    <button className="btn btn-sm btn-ghost-light" onClick={() => bulk('sold_out')}>Esgotado</button>
                    <button className="btn btn-sm btn-ghost-light" onClick={() => bulk('archived')}>Arquivar</button>
                    {categories.length > 0 && (
                        <div className="flex gap-1">
                            <select className="field !min-h-10 !w-40 !border-champagne/40 !bg-ink text-paper" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Mudar categoria">
                                <option value="">Mudar categoria…</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button className="btn btn-sm btn-champagne" disabled={!category} onClick={() => bulk('category', { category_id: category })}>OK</button>
                        </div>
                    )}
                    <ConfirmButton className="btn btn-sm btn-ghost-light ml-auto !border-red-300 !text-red-200" title="Excluir produtos?" message={`${selected.length} produto(s) e suas fotos serão excluídos permanentemente.`} onConfirm={() => bulk('delete')}>
                        <Icon name="delete" /> Excluir
                    </ConfirmButton>
                </div>
            )}

            {products.data.length === 0 ? (
                <div className="card flex flex-col items-center px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne text-2xl"><Icon name="shirt" /></span>
                    <p className="mt-4 font-serif text-2xl">{filters.q || filters.status || filters.category ? 'Nenhum produto encontrado' : 'Nenhum produto ainda'}</p>
                    <p className="mt-1 text-sm text-muted">Cadastre sua primeira peça para ela aparecer no catálogo.</p>
                    <Link href="/admin/produtos/novo" className="btn btn-solid mt-6"><Icon name="plus" /> Novo produto</Link>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="hidden grid-cols-[40px_64px_1fr_140px_120px_110px_96px] items-center gap-4 border-b border-line bg-soft px-4 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted md:grid">
                        <input type="checkbox" className="h-4 w-4 accent-ink" checked={allSelected} onChange={() => setSelected(allSelected ? [] : allIds)} aria-label="Selecionar todos" />
                        <span />
                        <span>Produto</span>
                        <span>Preço</span>
                        <span>Status</span>
                        <span className="text-right">Vistos / pedidos</span>
                        <span />
                    </div>
                    <ul className="divide-y divide-line">
                        {products.data.map((p) => {
                            const [label, tone] = STATUS[p.status];
                            return (
                                <li key={p.id} className={`grid grid-cols-[32px_56px_1fr_auto] items-center gap-3 px-3 py-3 md:grid-cols-[40px_64px_1fr_140px_120px_110px_96px] md:gap-4 md:px-4 ${selected.includes(p.id) ? 'bg-soft' : ''}`}>
                                    <input type="checkbox" className="h-4 w-4 accent-ink" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} aria-label={`Selecionar ${p.name}`} />
                                    <Link href={`/admin/produtos/${p.id}/editar`} className="block aspect-[4/5] w-14 overflow-hidden bg-soft md:w-16">
                                        {p.image ? <img src={p.image.src} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-muted"><Icon name="image" /></span>}
                                    </Link>
                                    <div className="min-w-0">
                                        <Link href={`/admin/produtos/${p.id}/editar`} className="block truncate font-medium hover:underline">{p.name}</Link>
                                        <p className="truncate text-xs text-muted">{[p.category, p.sku && `SKU ${p.sku}`].filter(Boolean).join(' · ') || 'Sem categoria'}</p>
                                        <div className="mt-1 flex items-center gap-2 md:hidden">
                                            <Badge tone={tone}>{label}</Badge>
                                            {p.price && <span className="text-xs">{formatPrice(p.sale_price ?? p.price, site)}</span>}
                                            {p.is_featured && <Icon name="star" className="text-xs text-champagne" />}
                                        </div>
                                    </div>
                                    <span className="hidden text-sm md:block">
                                        {p.sale_price ? <><span className="block">{formatPrice(p.sale_price, site)}</span><span className="text-xs text-muted line-through">{formatPrice(p.price, site)}</span></> : formatPrice(p.price, site) ?? <span className="text-muted">—</span>}
                                    </span>
                                    <span className="hidden items-center gap-2 md:flex"><Badge tone={tone}>{label}</Badge>{p.is_featured && <Icon name="star" className="text-champagne" label="Destaque" />}</span>
                                    <span className="hidden text-right text-sm tabular-nums text-muted md:block">{p.views} / {p.clicks}</span>
                                    <div className="flex justify-end">
                                        <Link href={`/admin/produtos/${p.id}/editar`} className="flex h-11 w-11 items-center justify-center text-lg text-ink/70 hover:bg-soft" aria-label="Editar"><Icon name="edit" /></Link>
                                        <button onClick={() => router.post(`/admin/produtos/${p.id}/duplicar`)} className="hidden h-11 w-11 items-center justify-center text-lg text-ink/70 hover:bg-soft md:flex" aria-label="Duplicar" title="Duplicar"><Icon name="copy" /></button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {products.last_page > 1 && (
                <nav className="mt-6 flex flex-wrap justify-center gap-1" aria-label="Paginação">
                    {products.links.map((l, i) => (
                        <Link key={i} href={l.url ?? '#'} preserveState
                            className={`flex h-10 min-w-10 items-center justify-center px-2 text-sm ${l.active ? 'bg-ink text-paper' : 'hover:bg-paper'} ${!l.url ? 'pointer-events-none opacity-30' : ''}`}>
                            {i === 0 ? <Icon name="chevron-left" /> : i === products.links.length - 1 ? <Icon name="chevron-right" /> : l.label}
                        </Link>
                    ))}
                </nav>
            )}
        </>
    );
}
