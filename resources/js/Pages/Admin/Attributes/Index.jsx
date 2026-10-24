import { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, ConfirmButton, IconButton, PageHeader, SortableList } from '../../../Components/Admin/ui';
import Icon from '../../../Components/Icon';

function AddForm({ type }) {
    const isColor = type === 'cores';
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', ...(isColor ? { hex: '#0B0B0B' } : {}) });
    return (
        <form onSubmit={(e) => { e.preventDefault(); post(`/admin/atributos/${type}`, { preserveScroll: true, onSuccess: () => reset('name') }); }} className="flex gap-2">
            {isColor && (
                <label className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden border border-line" style={{ background: data.hex }} title="Escolher cor">
                    <input type="color" value={data.hex} onChange={(e) => setData('hex', e.target.value.toUpperCase())} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Cor" />
                </label>
            )}
            <div className="flex-1">
                <input className="field" placeholder={isColor ? 'Nome da cor (ex.: Off-white)' : 'Tamanho (ex.: P, M, 38)'} value={data.name} onChange={(e) => setData('name', e.target.value)} aria-label="Nome" />
                {(errors.name || errors.hex) && <p className="mt-1 text-xs text-red-700">{errors.name || errors.hex}</p>}
            </div>
            <button className="btn btn-solid h-12 shrink-0 !px-4" disabled={processing || !data.name} aria-label="Adicionar"><Icon name="plus" /><span className="hidden sm:inline">Adicionar</span></button>
        </form>
    );
}

function Row({ item, type, handle }) {
    const isColor = type === 'cores';
    const [edit, setEdit] = useState(false);
    const [name, setName] = useState(item.name);
    const [hex, setHex] = useState(item.hex);

    const save = () => router.put(`/admin/atributos/${type}/${item.id}`, { name, ...(isColor ? { hex } : {}) }, { preserveScroll: true, onSuccess: () => setEdit(false) });

    return (
        <div className="flex items-center gap-2 bg-paper py-1.5 pl-1 pr-2">
            {handle}
            {isColor && (
                <label className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-line ${edit ? 'cursor-pointer' : ''}`} style={{ background: hex }}>
                    {edit && <input type="color" value={hex} onChange={(e) => setHex(e.target.value.toUpperCase())} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Cor" />}
                </label>
            )}
            {edit ? (
                <input className="field !min-h-10 flex-1" value={name} onChange={(e) => setName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && save()} aria-label="Nome" />
            ) : (
                <span className="flex-1 text-sm">{item.name} {isColor && <span className="ml-1 text-xs uppercase text-muted">{item.hex}</span>}</span>
            )}
            {edit ? (
                <>
                    <IconButton icon="check" label="Salvar" onClick={save} />
                    <IconButton icon="close" label="Cancelar" onClick={() => { setEdit(false); setName(item.name); setHex(item.hex); }} />
                </>
            ) : (
                <>
                    <IconButton icon="edit" label="Editar" onClick={() => setEdit(true)} />
                    <ConfirmButton icon="delete" label="Excluir" title={`Excluir "${item.name}"?`} message="As variações de produtos que usam este item perderão essa informação." onConfirm={() => router.delete(`/admin/atributos/${type}/${item.id}`, { preserveScroll: true })} />
                </>
            )}
        </div>
    );
}

function List({ type, items: initial, title, description, empty }) {
    const [items, setItems] = useState(initial);
    useEffect(() => setItems(initial), [initial]);
    return (
        <Card title={title} description={description}>
            <AddForm type={type} />
            {items.length === 0 ? (
                <p className="mt-4 bg-soft p-4 text-center text-sm text-muted">{empty}</p>
            ) : (
                <SortableList items={items} onReorder={(list) => { setItems(list); router.post(`/admin/atributos/${type}/ordem`, { ids: list.map((i) => i.id) }, { preserveScroll: true, preserveState: true }); }} className="mt-4 divide-y divide-line border border-line">
                    {(item, handle) => <Row item={item} type={type} handle={handle} />}
                </SortableList>
            )}
        </Card>
    );
}

export default function Attributes({ sizes, colors }) {
    return (
        <>
            <Head title="Tamanhos e cores" />
            <PageHeader title="Tamanhos e cores" subtitle="Listas reutilizáveis nas variações dos produtos. A ordem aqui é a ordem na loja." />
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                <List type="tamanhos" items={sizes} title="Tamanhos" description="Ex.: PP, P, M, G, GG ou numéricos." empty="Nenhum tamanho cadastrado." />
                <List type="cores" items={colors} title="Cores" description="Nome e cor exibida na loja." empty="Nenhuma cor cadastrada." />
            </div>
        </>
    );
}
