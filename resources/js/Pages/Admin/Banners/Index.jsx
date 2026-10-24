import { useEffect, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Badge, ConfirmButton, IconButton, ImagePicker, Input, Modal, PageHeader, SortableList, Toggle } from '../../../Components/Admin/ui';
import Icon from '../../../Components/Icon';

function BannerForm({ banner, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        title: banner?.title ?? '',
        subtitle: banner?.subtitle ?? '',
        link_url: banner?.link_url ?? '',
        button_label: banner?.button_label ?? '',
        image_alt: banner?.image_alt ?? '',
        is_active: banner?.is_active ?? true,
        image: null,
        image_crop: null,
        mobile_image: null,
        mobile_image_crop: null,
        remove_mobile: false,
        ...(banner ? { _method: 'put' } : {}),
    });

    const submit = (e) => {
        e.preventDefault();
        post(banner ? `/admin/banners/${banner.id}` : '/admin/banners', { forceFormData: true, preserveScroll: true, onSuccess: onClose });
    };

    return (
        <Modal open wide onClose={onClose} title={banner ? 'Editar banner' : 'Novo banner'}
            footer={<><button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button><button form="banner-form" className="btn btn-solid" disabled={processing}>{processing ? 'Enviando…' : 'Salvar'}</button></>}>
            <form id="banner-form" onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <ImagePicker label="Imagem (desktop · 16:9)" current={banner?.image} aspect={16 / 9} error={errors.image}
                        onFile={(file, crop) => setData((d) => ({ ...d, image: file, image_crop: crop }))} />
                    <ImagePicker label="Imagem mobile (4:5 · opcional)" current={data.remove_mobile ? null : banner?.mobile} aspect={4 / 5} error={errors.mobile_image}
                        onFile={(file, crop) => setData((d) => ({ ...d, mobile_image: file, mobile_image_crop: crop, remove_mobile: false }))}
                        onRemove={() => setData((d) => ({ ...d, mobile_image: null, remove_mobile: true }))} />
                </div>
                <Input label="Texto alternativo" value={data.image_alt} onChange={(e) => setData('image_alt', e.target.value)} error={errors.image_alt} hint="Descreve a imagem para acessibilidade." />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Título (opcional)" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} />
                    <Input label="Linha acima do título (opcional)" value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} error={errors.subtitle} />
                    <Input label="Link (opcional)" value={data.link_url} onChange={(e) => setData('link_url', e.target.value)} error={errors.link_url} placeholder="/produtos ou https://" />
                    <Input label="Texto do botão (opcional)" value={data.button_label} onChange={(e) => setData('button_label', e.target.value)} error={errors.button_label} />
                </div>
                <Toggle label="Ativo" checked={data.is_active} onChange={(v) => setData('is_active', v)} />
            </form>
        </Modal>
    );
}

export default function Banners({ banners }) {
    const [items, setItems] = useState(banners);
    const [editing, setEditing] = useState(null);
    useEffect(() => setItems(banners), [banners]);

    return (
        <>
            <Head title="Banners" />
            <PageHeader title="Banners" subtitle="Carrossel no topo da home. Arraste para ordenar.">
                <Link href="/admin/configuracoes/home" className="btn btn-outline btn-sm"><Icon name="layout" /> Seções da home</Link>
                <button className="btn btn-solid" onClick={() => setEditing('new')}><Icon name="plus" /> Novo banner</button>
            </PageHeader>

            {items.length === 0 ? (
                <div className="card flex flex-col items-center px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne text-2xl"><Icon name="image" /></span>
                    <p className="mt-4 font-serif text-2xl">Nenhum banner</p>
                    <p className="mt-1 max-w-sm text-sm text-muted">Sem banners, a home abre com a logo e a bio da marca.</p>
                </div>
            ) : (
                <SortableList items={items} onReorder={(list) => { setItems(list); router.post('/admin/banners/ordem', { ids: list.map((b) => b.id) }, { preserveScroll: true, preserveState: true }); }} className="card divide-y divide-line">
                    {(b, handle) => (
                        <div className="flex items-center gap-2 bg-paper py-2 pl-1 pr-2 md:gap-3">
                            {handle}
                            <div className="aspect-video w-28 shrink-0 overflow-hidden bg-soft md:w-40">{b.image && <img src={b.image} alt="" className="h-full w-full object-cover" />}</div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{b.title || <span className="text-muted">Sem título</span>}</p>
                                <p className="truncate text-xs text-muted">{b.link_url || 'Sem link'}{b.mobile && ' · versão mobile'}</p>
                            </div>
                            {!b.is_active && <Badge tone="muted">Inativo</Badge>}
                            <IconButton icon="edit" label="Editar" onClick={() => setEditing(b)} />
                            <ConfirmButton icon="delete" label="Excluir" title="Excluir banner?" onConfirm={() => router.delete(`/admin/banners/${b.id}`, { preserveScroll: true })} />
                        </div>
                    )}
                </SortableList>
            )}
            {editing && <BannerForm banner={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
        </>
    );
}
