import { useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, ConfirmButton, Input, PageHeader, Select, Textarea, Toggle, STATUS } from '../../../Components/Admin/ui';
import ImageManager from '../../../Components/Admin/ImageManager';
import Icon from '../../../Components/Icon';

const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function TagInput({ value, onChange, suggestions }) {
    const [text, setText] = useState('');
    const add = (t) => {
        const v = t.trim();
        if (v && !value.includes(v)) onChange([...value, v]);
        setText('');
    };
    return (
        <div>
            <label className="label" htmlFor="tags">Tags</label>
            <div className="field flex !h-auto min-h-12 flex-wrap items-center gap-1.5 py-2">
                {value.map((t) => (
                    <span key={t} className="flex items-center gap-1 bg-soft py-1 pl-2.5 pr-1 text-xs">
                        {t}
                        <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="flex h-6 w-6 items-center justify-center" aria-label={`Remover ${t}`}><Icon name="close" /></button>
                    </span>
                ))}
                <input id="tags" list="tag-suggestions" value={text} onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(text); } }}
                    onBlur={() => text && add(text)}
                    className="min-w-24 flex-1 bg-transparent text-sm outline-none" placeholder={value.length ? '' : 'Digite e tecle Enter'} />
                <datalist id="tag-suggestions">{suggestions.filter((s) => !value.includes(s)).map((s) => <option key={s} value={s} />)}</datalist>
            </div>
        </div>
    );
}

function Variants({ data, setData, sizes, colors }) {
    const key = (s, c) => `${s ?? ''}-${c ?? ''}`;
    const map = useMemo(() => Object.fromEntries(data.variants.map((v) => [key(v.size_id, v.color_id), v])), [data.variants]);
    const selSizes = [...new Set(data.variants.map((v) => v.size_id).filter(Boolean))];
    const selColors = [...new Set(data.variants.map((v) => v.color_id).filter(Boolean))];

    // recalcula as combinações a partir das seleções, preservando estoques
    const rebuild = (ss, cc) => {
        const combos = [];
        const sList = ss.length ? ss : [null];
        const cList = cc.length ? cc : [null];
        for (const s of sList) for (const c of cList) {
            if (s === null && c === null) continue;
            combos.push({ size_id: s, color_id: c, stock: map[key(s, c)]?.stock ?? 0 });
        }
        setData('variants', combos);
    };

    const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    const sizeName = (id) => sizes.find((s) => s.id === id)?.name;
    const color = (id) => colors.find((c) => c.id === id);

    if (sizes.length === 0 && colors.length === 0) {
        return (
            <p className="flex items-start gap-2 bg-soft p-4 text-sm text-muted">
                <Icon name="info" className="mt-0.5 text-ink" />
                <span>Cadastre tamanhos e cores em <Link href="/admin/atributos" className="text-ink underline underline-offset-4">Tamanhos e cores</Link> para criar variações.</span>
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {sizes.length > 0 && (
                <fieldset>
                    <legend className="label">Tamanhos disponíveis</legend>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((s) => (
                            <button type="button" key={s.id} aria-pressed={selSizes.includes(s.id)} onClick={() => rebuild(toggleIn(selSizes, s.id), selColors)}
                                className={`btn btn-sm min-w-12 !tracking-normal ${selSizes.includes(s.id) ? 'btn-solid' : 'btn-outline border-line'}`}>{s.name}</button>
                        ))}
                    </div>
                </fieldset>
            )}
            {colors.length > 0 && (
                <fieldset>
                    <legend className="label">Cores disponíveis</legend>
                    <div className="flex flex-wrap gap-2">
                        {colors.map((c) => (
                            <button type="button" key={c.id} aria-pressed={selColors.includes(c.id)} onClick={() => rebuild(selSizes, toggleIn(selColors, c.id))}
                                className={`btn btn-sm !normal-case !tracking-normal ${selColors.includes(c.id) ? 'btn-solid' : 'btn-outline border-line'}`}>
                                <span className="h-4 w-4 rounded-full border border-line" style={{ background: c.hex }} />{c.name}
                            </button>
                        ))}
                    </div>
                </fieldset>
            )}

            <Toggle label="Controlar estoque por variação" hint="Desligado: todas as variações aparecem sempre disponíveis." checked={data.track_stock} onChange={(v) => setData('track_stock', v)} />

            {data.track_stock && data.variants.length > 0 && (
                <div className="overflow-hidden border border-line">
                    <div className="grid grid-cols-[1fr_110px] bg-soft px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted"><span>Variação</span><span>Estoque</span></div>
                    <ul className="divide-y divide-line">
                        {data.variants.map((v, i) => (
                            <li key={key(v.size_id, v.color_id)} className="grid grid-cols-[1fr_110px] items-center gap-3 px-4 py-2">
                                <span className="flex items-center gap-2 text-sm">
                                    {v.color_id && <span className="h-4 w-4 rounded-full border border-line" style={{ background: color(v.color_id)?.hex }} />}
                                    {[sizeName(v.size_id), color(v.color_id)?.name].filter(Boolean).join(' · ')}
                                </span>
                                <input type="number" min="0" inputMode="numeric" className={`field !min-h-10 text-center ${Number(v.stock) === 0 ? '!border-amber-400' : ''}`} value={v.stock ?? 0}
                                    onChange={(e) => setData('variants', data.variants.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)))} aria-label="Estoque" />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function ProductForm({ product, categories, sizes, colors, measurementTables, allTags }) {
    const editing = Boolean(product);
    const [slugTouched, setSlugTouched] = useState(editing);
    const { data, setData, post, put, processing, errors, isDirty } = useForm({
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        sku: product?.sku ?? '',
        description: product?.description ?? '',
        category_id: product?.category_id ?? '',
        measurement_table_id: product?.measurement_table_id ?? '',
        tags: product?.tags ?? [],
        price: product?.price ?? '',
        sale_price: product?.sale_price ?? '',
        sale_starts_at: product?.sale_starts_at ?? '',
        sale_ends_at: product?.sale_ends_at ?? '',
        status: product?.status ?? 'draft',
        is_featured: product?.is_featured ?? false,
        track_stock: product?.track_stock ?? false,
        composition: product?.composition ?? '',
        care: product?.care ?? '',
        measurements_note: product?.measurements_note ?? '',
        notes: product?.notes ?? '',
        seo_title: product?.seo_title ?? '',
        seo_description: product?.seo_description ?? '',
        variants: product?.variants ?? [],
    });

    const submit = (e) => {
        e.preventDefault();
        editing ? put(`/admin/produtos/${product.id}`, { preserveScroll: true }) : post('/admin/produtos');
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <>
            <Head title={editing ? product.name : 'Novo produto'} />
            <PageHeader title={editing ? product.name : 'Novo produto'} back="/admin/produtos" subtitle={editing ? `${product.views_count} visualizações · ${product.order_clicks_count} pedidos pelo WhatsApp` : null}>
                {editing && (
                    <>
                        {['active', 'sold_out'].includes(product.status) && (
                            <a href={`/produtos/${product.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm"><Icon name="external" /> Ver na loja</a>
                        )}
                        <button type="button" onClick={() => router.post(`/admin/produtos/${product.id}/duplicar`)} className="btn btn-outline btn-sm"><Icon name="copy" /> Duplicar</button>
                    </>
                )}
            </PageHeader>

            <form onSubmit={submit} className="grid gap-4 pb-24 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-6 lg:pb-0">
                <div className="min-w-0 space-y-4 lg:space-y-6">
                    <Card title="Informações">
                        <div className="space-y-4">
                            <Input label="Nome" value={data.name} error={errors.name} required
                                onChange={(e) => { setData((d) => ({ ...d, name: e.target.value, slug: slugTouched ? d.slug : slugify(e.target.value) })); }} />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input label="Endereço (slug)" value={data.slug} error={errors.slug} hint={`/produtos/${data.slug || '...'}`} onChange={(e) => { setSlugTouched(true); setData('slug', slugify(e.target.value)); }} />
                                <Input label="SKU / referência" value={data.sku} error={errors.sku} onChange={(e) => setData('sku', e.target.value)} />
                            </div>
                            <Textarea label="Descrição" rows={5} value={data.description} error={errors.description} onChange={(e) => setData('description', e.target.value)} />
                        </div>
                    </Card>

                    <Card title="Fotos" description={editing ? 'A primeira foto (ou a marcada como capa) aparece no catálogo.' : null}>
                        {editing ? (
                            <ImageManager productId={product.id} images={product.images} />
                        ) : (
                            <p className="flex items-center gap-2 bg-soft p-4 text-sm text-muted"><Icon name="info" className="text-ink" /> Salve o produto para adicionar as fotos.</p>
                        )}
                    </Card>

                    <Card title="Preço">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="Preço" type="number" step="0.01" min="0" inputMode="decimal" value={data.price} error={errors.price} onChange={(e) => setData('price', e.target.value)} hint="Deixe vazio para não exibir preço." />
                            <Input label="Preço promocional" type="number" step="0.01" min="0" inputMode="decimal" value={data.sale_price} error={errors.sale_price} onChange={(e) => setData('sale_price', e.target.value)} />
                            {data.sale_price !== '' && data.sale_price !== null && (
                                <>
                                    <Input label="Promoção começa em" type="datetime-local" value={data.sale_starts_at} error={errors.sale_starts_at} onChange={(e) => setData('sale_starts_at', e.target.value)} hint="Opcional" />
                                    <Input label="Promoção termina em" type="datetime-local" value={data.sale_ends_at} error={errors.sale_ends_at} onChange={(e) => setData('sale_ends_at', e.target.value)} hint="Opcional" />
                                </>
                            )}
                        </div>
                    </Card>

                    <Card title="Variações" description="Tamanhos e cores em que a peça está disponível.">
                        <Variants data={data} setData={setData} sizes={sizes} colors={colors} />
                    </Card>

                    <Card title="Detalhes da peça" description="Só aparecem na loja os campos preenchidos.">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Textarea label="Composição / material" value={data.composition} onChange={(e) => setData('composition', e.target.value)} error={errors.composition} rows={3} />
                            <Textarea label="Cuidados" value={data.care} onChange={(e) => setData('care', e.target.value)} error={errors.care} rows={3} />
                            <Textarea label="Medidas (texto)" value={data.measurements_note} onChange={(e) => setData('measurements_note', e.target.value)} error={errors.measurements_note} rows={3} />
                            <Textarea label="Observações" value={data.notes} onChange={(e) => setData('notes', e.target.value)} error={errors.notes} rows={3} />
                        </div>
                        <Select label="Tabela de medidas" className="mt-4" value={data.measurement_table_id} onChange={(e) => setData('measurement_table_id', e.target.value)} hint={measurementTables.length ? 'Se vazio, usa a tabela da categoria (se houver).' : 'Crie tabelas em Tabelas de medidas.'}>
                            <option value="">Nenhuma / da categoria</option>
                            {measurementTables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </Select>
                    </Card>

                    <Card title="SEO" description="Como o produto aparece no Google e ao compartilhar.">
                        <div className="space-y-4">
                            <Input label="Título" value={data.seo_title} onChange={(e) => setData('seo_title', e.target.value)} error={errors.seo_title} maxLength={70} hint={`${data.seo_title.length}/70 · vazio = nome do produto`} />
                            <Textarea label="Descrição" rows={3} value={data.seo_description} onChange={(e) => setData('seo_description', e.target.value)} error={errors.seo_description} maxLength={320} hint={`${data.seo_description.length}/320`} />
                        </div>
                        <div className="mt-4 border border-line p-4">
                            <p className="truncate text-[15px] text-[#1a0dab]">{data.seo_title || data.name || 'Título do produto'}</p>
                            <p className="truncate text-xs text-emerald-700">{window.location.origin}/produtos/{data.slug}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-muted">{data.seo_description || data.description || 'Descrição do produto.'}</p>
                        </div>
                    </Card>
                </div>

                <div className="space-y-4 lg:sticky lg:top-6 lg:space-y-6">
                    <Card title="Publicação">
                        <div className="space-y-4">
                            <Select label="Status" value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status}>
                                {Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                            </Select>
                            <Toggle label="Destaque na home" checked={data.is_featured} onChange={(v) => setData('is_featured', v)} />
                        </div>
                        <button className="btn btn-solid mt-5 hidden w-full lg:flex" disabled={processing}>{editing ? 'Salvar alterações' : 'Criar produto'}</button>
                        {hasErrors && <p className="mt-3 text-xs text-red-700">Revise os campos destacados.</p>}
                    </Card>

                    <Card title="Organização">
                        <div className="space-y-4">
                            <Select label="Categoria" value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} error={errors.category_id}>
                                <option value="">Sem categoria</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.parent_id ? '— ' : ''}{c.name}</option>)}
                            </Select>
                            <TagInput value={data.tags} onChange={(v) => setData('tags', v)} suggestions={allTags} />
                        </div>
                    </Card>

                    {editing && (
                        <ConfirmButton className="flex min-h-11 w-full items-center justify-center gap-2 text-xs uppercase tracking-[0.14em] text-red-800 hover:bg-red-50"
                            title="Excluir produto?" message="O produto e todas as fotos serão excluídos permanentemente."
                            onConfirm={() => router.delete(`/admin/produtos/${product.id}`)}>
                            <Icon name="delete" /> Excluir produto
                        </ConfirmButton>
                    )}
                </div>

                {/* Barra de salvar fixa (mobile/tablet) */}
                <div className="pb-safe fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-paper px-4 pt-3 lg:hidden">
                    <span className="flex-1 text-xs text-muted">{hasErrors ? <span className="text-red-700">Revise os campos</span> : isDirty ? 'Alterações não salvas' : ''}</span>
                    <button className="btn btn-solid" disabled={processing}>{editing ? 'Salvar' : 'Criar produto'}</button>
                </div>
            </form>
        </>
    );
}
