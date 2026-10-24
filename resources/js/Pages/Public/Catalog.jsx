import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ProductCard from '../../Components/ProductCard';
import EmptyState from '../../Components/EmptyState';
import Icon from '../../Components/Icon';

const ORDERS = { recentes: 'Mais recentes', 'menor-preco': 'Menor preço', 'maior-preco': 'Maior preço' };

function FilterSheet({ open, onClose, filters, categories, sizes, colors, priceRange, apply }) {
    const [min, setMin] = useState(filters.min ?? '');
    const [max, setMax] = useState(filters.max ?? '');
    useEffect(() => { setMin(filters.min ?? ''); setMax(filters.max ?? ''); }, [filters.min, filters.max]);
    if (!open) return null;

    const Chip = ({ active, onClick, children }) => (
        <button onClick={onClick} aria-pressed={active} className={`btn btn-sm !normal-case !tracking-normal ${active ? 'btn-solid' : 'btn-outline'}`}>{children}</button>
    );

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filtros">
            <button className="animate-fade absolute inset-0 bg-ink/40" onClick={onClose} aria-label="Fechar filtros" />
            <aside className="animate-right absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper">
                <div className="flex h-16 items-center justify-between border-b border-line px-5">
                    <p className="eyebrow">Filtrar</p>
                    <button onClick={onClose} className="-mr-2 flex h-12 w-12 items-center justify-center text-2xl" aria-label="Fechar"><Icon name="close" /></button>
                </div>
                <div className="flex-1 space-y-8 overflow-y-auto p-5">
                    {categories.length > 0 && (
                        <fieldset>
                            <legend className="label">Categoria</legend>
                            <div className="flex flex-wrap gap-2">
                                <Chip active={!filters.categoria} onClick={() => apply({ categoria: '' })}>Todas</Chip>
                                {categories.map((c) => <Chip key={c.id} active={filters.categoria === c.slug} onClick={() => apply({ categoria: c.slug })}>{c.name}</Chip>)}
                            </div>
                        </fieldset>
                    )}
                    {sizes.length > 0 && (
                        <fieldset>
                            <legend className="label">Tamanho</legend>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((s) => <Chip key={s.id} active={String(filters.tamanho) === String(s.id)} onClick={() => apply({ tamanho: String(filters.tamanho) === String(s.id) ? '' : s.id })}>{s.name}</Chip>)}
                            </div>
                        </fieldset>
                    )}
                    {colors.length > 0 && (
                        <fieldset>
                            <legend className="label">Cor</legend>
                            <div className="flex flex-wrap gap-3">
                                {colors.map((c) => {
                                    const active = String(filters.cor) === String(c.id);
                                    return (
                                        <button key={c.id} onClick={() => apply({ cor: active ? '' : c.id })} aria-pressed={active} className="flex flex-col items-center gap-1.5">
                                            <span className={`block h-10 w-10 rounded-full border ${active ? 'ring-1 ring-ink ring-offset-2' : 'border-line'}`} style={{ background: c.hex }} />
                                            <span className="text-[11px] text-muted">{c.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>
                    )}
                    {priceRange.max !== null && (
                        <fieldset>
                            <legend className="label">Faixa de preço</legend>
                            <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); apply({ min, max }); }}>
                                <input type="number" inputMode="decimal" min="0" className="field" placeholder="Mín." aria-label="Preço mínimo" value={min} onChange={(e) => setMin(e.target.value)} />
                                <span className="text-muted">—</span>
                                <input type="number" inputMode="decimal" min="0" className="field" placeholder="Máx." aria-label="Preço máximo" value={max} onChange={(e) => setMax(e.target.value)} />
                                <button className="btn btn-outline btn-sm h-12 shrink-0" aria-label="Aplicar faixa de preço"><Icon name="check" /></button>
                            </form>
                        </fieldset>
                    )}
                </div>
                <div className="pb-safe flex gap-3 border-t border-line p-4">
                    <button onClick={() => apply({ categoria: '', tamanho: '', cor: '', min: '', max: '' })} className="btn btn-outline flex-1">Limpar</button>
                    <button onClick={onClose} className="btn btn-solid flex-1">Ver peças</button>
                </div>
            </aside>
        </div>
    );
}

export default function Catalog({ products, filters, categories, sizes, colors, priceRange }) {
    const [q, setQ] = useState(filters.q ?? '');
    const [sheet, setSheet] = useState(false);
    const current = categories.find((c) => c.slug === filters.categoria);
    const activeCount = ['tamanho', 'cor', 'min', 'max'].filter((k) => filters[k]).length + (filters.categoria ? 1 : 0);

    const apply = (patch) => {
        const next = { ...filters, ...patch };
        Object.keys(next).forEach((k) => (next[k] === '' || next[k] == null) && delete next[k]);
        router.get('/produtos', next, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title={current ? current.name : 'Produtos'} />
            <section className="border-b border-line bg-soft">
                <div className="container-page py-10 text-center md:py-14">
                    <p className="eyebrow text-muted">Coleção</p>
                    <h1 className="mt-2 text-4xl md:text-5xl">{current ? current.name : 'Todos os produtos'}</h1>
                    <p className="mt-3 text-sm text-muted">{products.total} {products.total === 1 ? 'peça' : 'peças'}</p>
                </div>
            </section>

            {categories.length > 0 && (
                <nav className="border-b border-line" aria-label="Categorias">
                    <div className="container-page scrollbar-none flex gap-6 overflow-x-auto">
                        <button onClick={() => apply({ categoria: '' })} className={`eyebrow min-h-12 shrink-0 border-b ${!filters.categoria ? 'border-ink' : 'border-transparent text-muted'}`}>Todos</button>
                        {categories.map((c) => (
                            <button key={c.id} onClick={() => apply({ categoria: c.slug })} className={`eyebrow min-h-12 shrink-0 border-b ${filters.categoria === c.slug ? 'border-ink' : 'border-transparent text-muted'}`}>{c.name}</button>
                        ))}
                    </div>
                </nav>
            )}

            <div className="container-page sticky top-16 z-30 bg-paper/95 py-3 backdrop-blur md:top-20">
                <div className="flex items-center gap-2">
                    <form onSubmit={(e) => { e.preventDefault(); apply({ q }); }} className="relative flex-1" role="search">
                        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <label className="sr-only" htmlFor="busca">Buscar por nome</label>
                        <input id="busca" type="search" className="field !pl-11" placeholder="Buscar por nome" value={q} onChange={(e) => setQ(e.target.value)} />
                    </form>
                    <button onClick={() => setSheet(true)} className="btn btn-outline relative h-12 shrink-0 !px-4" aria-label="Filtros">
                        <Icon name="filter" className="text-base" />
                        <span className="hidden sm:inline">Filtrar</span>
                        {activeCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-paper">{activeCount}</span>}
                    </button>
                    <div className="relative shrink-0">
                        <label className="sr-only" htmlFor="ordem">Ordenar</label>
                        <select id="ordem" className="field w-auto !pr-9 text-[13px]" value={filters.ordem ?? 'recentes'} onChange={(e) => apply({ ordem: e.target.value })}>
                            {Object.entries(ORDERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <section className="container-page mt-6">
                {products.data.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-y-14">
                        {products.data.map((p, i) => <ProductCard key={p.id} product={p} eager={i < 2} />)}
                    </div>
                ) : (
                    <EmptyState
                        icon="search"
                        title={filters.q || activeCount ? 'Nenhuma peça encontrada' : 'A coleção chega em breve'}
                        action={(filters.q || activeCount > 0) && <Link href="/produtos" className="btn btn-outline">Limpar busca e filtros</Link>}
                    >
                        {filters.q || activeCount ? 'Tente outra busca ou ajuste os filtros.' : 'As peças aparecerão aqui assim que forem publicadas.'}
                    </EmptyState>
                )}

                {products.last_page > 1 && (
                    <nav className="mt-14 flex items-center justify-center gap-1" aria-label="Paginação">
                        {products.links.map((l, i) => {
                            const label = i === 0 ? <Icon name="chevron-left" /> : i === products.links.length - 1 ? <Icon name="chevron-right" /> : l.label;
                            return (
                                <Link
                                    key={i}
                                    href={l.url ?? '#'}
                                    preserveScroll={false}
                                    aria-label={i === 0 ? 'Anterior' : i === products.links.length - 1 ? 'Próxima' : `Página ${l.label}`}
                                    aria-current={l.active ? 'page' : undefined}
                                    className={`flex h-11 min-w-11 items-center justify-center text-sm ${l.active ? 'bg-ink text-paper' : 'hover:bg-soft'} ${!l.url ? 'pointer-events-none opacity-30' : ''}`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </section>

            <FilterSheet open={sheet} onClose={() => setSheet(false)} filters={filters} categories={categories} sizes={sizes} colors={colors} priceRange={priceRange} apply={apply} />
        </>
    );
}
