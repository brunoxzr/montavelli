import { useEffect, useId, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ConfirmButton, CropModal, IconButton, Modal, SortableList, ratioOf } from './ui';
import Icon from '../Icon';
import { toast } from '../Toast';

/**
 * Upload múltiplo: cada arquivo passa pelo editor de recorte (ou corte
 * centralizado automático), é enviado e vira as variações padronizadas.
 */
export default function ImageManager({ productId, images }) {
    const { site } = usePage().props;
    const id = useId();
    const [items, setItems] = useState(images);
    const [queue, setQueue] = useState([]);
    const [alt, setAlt] = useState('');
    const [uploading, setUploading] = useState(0);
    const [editing, setEditing] = useState(null);
    const ratio = ratioOf(site.image_ratio);
    const maxMb = 8;

    useEffect(() => setItems(images), [images]);

    const pick = (files) => {
        const valid = [...files].filter((f) => {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
                toast(`${f.name}: use JPG, PNG ou WebP`, 'error');
                return false;
            }
            if (f.size > maxMb * 1024 * 1024) {
                toast(`${f.name}: máximo de ${maxMb} MB`, 'error');
                return false;
            }
            return true;
        });
        setQueue((q) => [...q, ...valid]);
    };

    const upload = (file, crop, altText) => {
        setUploading((n) => n + 1);
        router.post(`/admin/produtos/${productId}/imagens`, { image: file, alt: altText || '', ...(crop ? { crop } : {}) }, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            only: ['product', 'flash'],
            onFinish: () => setUploading((n) => n - 1),
            onError: (e) => toast(e.image || 'Falha no envio da imagem', 'error'),
        });
    };

    const next = (crop) => {
        const [file, ...rest] = queue;
        upload(file, crop, alt);
        setAlt('');
        setQueue(rest);
    };

    const autoAll = () => {
        queue.forEach((f) => upload(f, null, ''));
        setQueue([]);
    };

    const reorder = (list) => {
        setItems(list);
        router.post(`/admin/produtos/${productId}/imagens/ordem`, { ids: list.map((i) => i.id) }, { preserveScroll: true, preserveState: true, only: ['product'] });
    };

    return (
        <div>
            {items.length > 0 && (
                <SortableList items={items} onReorder={reorder} grid className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {(img, handle) => (
                        <div className="group relative bg-soft">
                            <div style={{ aspectRatio: site.image_ratio.replace(':', '/'), background: img.placeholder }}>
                                <img src={img.thumb} alt={img.alt || ''} className="h-full w-full object-cover" />
                            </div>
                            {img.is_cover && <span className="absolute left-1.5 top-1.5 bg-ink px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-champagne">Capa</span>}
                            {!img.alt && <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs text-amber-800" title="Sem texto alternativo"><Icon name="alert" /></span>}
                            <div className="flex items-center justify-between border-t border-line bg-paper">
                                {handle}
                                <div className="flex">
                                    <IconButton icon="edit" label="Texto alternativo e capa" onClick={() => setEditing(img)} className="!h-10 !w-9 text-base" />
                                    <ConfirmButton icon="delete" label="Remover imagem" title="Remover imagem?" className="!h-10 !w-9 text-base" onConfirm={() => router.delete(`/admin/imagens/${img.id}`, { preserveScroll: true, only: ['product', 'flash'] })} />
                                </div>
                            </div>
                        </div>
                    )}
                </SortableList>
            )}

            <label
                htmlFor={id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files); }}
                className={`${items.length ? 'mt-4' : ''} flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-champagne bg-soft/60 p-6 text-center transition-colors hover:border-ink`}
            >
                <Icon name="upload" className="text-3xl text-ink/60" />
                <span className="text-sm font-medium">{uploading ? `Enviando ${uploading} imagem(ns)…` : 'Adicionar fotos'}</span>
                <span className="text-xs text-muted">JPG, PNG ou WebP até {maxMb} MB · proporção {site.image_ratio} · arraste para ordenar</span>
            </label>
            <input id={id} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />

            <CropModal
                file={queue[0] ?? null}
                aspect={ratio}
                title={queue.length > 1 ? `Enquadrar foto (${queue.length} na fila)` : 'Enquadrar foto'}
                onCancel={() => setQueue((q) => q.slice(1))}
                onConfirm={next}
                extra={
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="label" htmlFor="alt-new">Texto alternativo (acessibilidade)</label>
                            <input id="alt-new" className="field" placeholder="Ex.: camisa de linho branca, vista frontal" value={alt} onChange={(e) => setAlt(e.target.value)} />
                        </div>
                        {queue.length > 1 && (
                            <button type="button" onClick={autoAll} className="text-xs underline underline-offset-4">Enviar todas com corte centralizado automático</button>
                        )}
                    </div>
                }
            />

            {editing && <EditImage image={editing} onClose={() => setEditing(null)} />}
        </div>
    );
}

function EditImage({ image, onClose }) {
    const [alt, setAlt] = useState(image.alt ?? '');
    return (
        <Modal open onClose={onClose} title="Imagem"
            footer={<>
                {!image.is_cover && <button type="button" className="btn btn-outline mr-auto" onClick={() => { router.post(`/admin/imagens/${image.id}/capa`, {}, { preserveScroll: true, only: ['product', 'flash'] }); onClose(); }}><Icon name="star" /> Definir como capa</button>}
                <button type="button" className="btn btn-solid" onClick={() => { router.patch(`/admin/imagens/${image.id}`, { alt }, { preserveScroll: true, only: ['product', 'flash'] }); onClose(); }}>Salvar</button>
            </>}>
            <img src={image.thumb} alt="" className="mx-auto mb-4 w-40" />
            <label className="label" htmlFor="alt-edit">Texto alternativo</label>
            <input id="alt-edit" className="field" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Descreva a imagem para leitores de tela" />
        </Modal>
    );
}
