import { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Badge, ConfirmButton, IconButton, ImagePicker, Input, Modal, PageHeader, Select, SortableList, Toggle, ratioOf } from '../../../Components/Admin/ui';
import Icon from '../../../Components/Icon';

function CategoryForm({ category, categories, measurementTables, onClose }) {
    const { site } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        parent_id: category?.parent_id ?? '',
        measurement_table_id: category?.measurement_table_id ?? '',
        is_active: category?.is_active ?? true,
        image: null,
        image_alt: category?.image_alt ?? '',
        remove_image: false,
        ...(category ? { _method: 'put' } : {}),
    });

    const submit = (e) => {
        e.preventDefault();
        post(category ? `/admin/categorias/${category.id}` : '/admin/categorias', { forceFormData: true, preserveScroll: true, onSuccess: onClose });
    };

    return (
        <Modal open onClose={onClose} title={category ? 'Editar categoria' : 'Nova categoria'}
            footer={<><button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button><button form="cat-form" className="btn btn-solid" disabled={processing}>Salvar</button></>}>
            <form id="cat-form" onSubmit={submit} className="space-y-4">
                <Input label="Nome" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} autoFocus />
                <Input label="Endereço (slug)" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} hint="Vazio = gerado a partir do nome." />
                <Select label="Categoria mãe" value={data.parent_id} onChange={(e) => setData('parent_id', e.target.value)} error={errors.parent_id} hint="Opcional, para subcategorias.">
                    <option value="">Nenhuma (principal)</option>
                    {categories.filter((c) => c.id !== category?.id && !c.parent_id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                {measurementTables.length > 0 && (
                    <Select label="Tabela de medidas padrão" value={data.measurement_table_id} onChange={(e) => setData('measurement_table_id', e.target.value)}>
                        <option value="">Nenhuma</option>
                        {measurementTables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                )}
                <ImagePicker label="Imagem (opcional)" current={data.remove_image ? null : category?.image} aspect={ratioOf(site.image_ratio)} error={errors.image}
                    onFile={(file) => setData((d) => ({ ...d, image: file, remove_image: false }))} onRemove={() => setData((d) => ({ ...d, image: null, remove_image: true }))} crop={false} />
                <Input label="Texto alternativo da imagem" value={data.image_alt} onChange={(e) => setData('image_alt', e.target.value)} />
                <Toggle label="Ativa" hint="Categorias inativas não aparecem na loja." checked={data.is_active} onChange={(v) => setData('is_active', v)} />
            </form>
        </Modal>
    );
}

export default function Categories({ categories, measurementTables }) {
    const [items, setItems] = useState(categories);
    const [editing, setEditing] = useState(null);
    useEffect(() => setItems(categories), [categories]);

    const parentName = (id) => categories.find((c) => c.id === id)?.name;

    return (
        <>
            <Head title="Categorias" />
            <PageHeader title="Categorias" subtitle="Arraste para definir a ordem na loja.">
                <button className="btn btn-solid" onClick={() => setEditing('new')}><Icon name="plus" /> Nova categoria</button>
            </PageHeader>

            {items.length === 0 ? (
                <div className="card flex flex-col items-center px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne text-2xl"><Icon name="folder" /></span>
                    <p className="mt-4 font-serif text-2xl">Nenhuma categoria</p>
                    <p className="mt-1 text-sm text-muted">Organize suas peças por categoria (ex.: camisas, calças).</p>
                    <button className="btn btn-solid mt-6" onClick={() => setEditing('new')}><Icon name="plus" /> Criar categoria</button>
                </div>
            ) : (
                <SortableList items={items} onReorder={(list) => { setItems(list); router.post('/admin/categorias/ordem', { ids: list.map((c) => c.id) }, { preserveScroll: true, preserveState: true }); }} className="card divide-y divide-line">
                    {(c, handle) => (
                        <div className="flex items-center gap-2 bg-paper py-2 pl-1 pr-2 md:gap-3">
                            {handle}
                            <div className="h-14 w-11 shrink-0 overflow-hidden bg-soft">{c.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}</div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{c.parent_id && <span className="text-muted">{parentName(c.parent_id)} / </span>}{c.name}</p>
                                <p className="truncate text-xs text-muted">{c.products_count} {c.products_count === 1 ? 'produto' : 'produtos'} · /{c.slug}</p>
                            </div>
                            {!c.is_active && <Badge tone="muted">Inativa</Badge>}
                            <IconButton icon="edit" label="Editar" onClick={() => setEditing(c)} />
                            <ConfirmButton icon="delete" label="Excluir" title={`Excluir "${c.name}"?`} message="Os produtos desta categoria ficarão sem categoria." onConfirm={() => router.delete(`/admin/categorias/${c.id}`, { preserveScroll: true })} />
                        </div>
                    )}
                </SortableList>
            )}

            {editing && <CategoryForm category={editing === 'new' ? null : editing} categories={categories} measurementTables={measurementTables} onClose={() => setEditing(null)} />}
        </>
    );
}
