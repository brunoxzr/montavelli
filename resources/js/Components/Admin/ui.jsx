import { useCallback, useEffect, useId, useState } from 'react';
import { Link } from '@inertiajs/react';
import Cropper from 'react-easy-crop';
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Icon from '../Icon';

export function PageHeader({ title, subtitle, back, children }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
            <div className="min-w-0">
                {back && (
                    <Link href={back} className="mb-2 inline-flex min-h-9 items-center gap-1 text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
                        <Icon name="arrow-left" /> Voltar
                    </Link>
                )}
                <h1 className="truncate text-3xl md:text-4xl">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>
            {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
    );
}

export function Card({ title, description, children, actions, className = '' }) {
    return (
        <section className={`card p-4 md:p-6 ${className}`}>
            {(title || actions) && (
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        {title && <h2 className="text-xl md:text-2xl">{title}</h2>}
                        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                    </div>
                    {actions}
                </div>
            )}
            {children}
        </section>
    );
}

export function Field({ label, error, hint, children, className = '', id }) {
    return (
        <div className={className}>
            {label && <label className="label" htmlFor={id}>{label}</label>}
            {children}
            {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
            {error && <p className="mt-1.5 text-xs text-red-700" role="alert">{error}</p>}
        </div>
    );
}

export function Input({ label, error, hint, className = '', ...props }) {
    const id = useId();
    return (
        <Field label={label} error={error} hint={hint} className={className} id={id}>
            <input id={id} className={`field ${error ? '!border-red-700' : ''}`} aria-invalid={!!error} {...props} value={props.value ?? ''} />
        </Field>
    );
}

export function Textarea({ label, error, hint, className = '', rows = 4, ...props }) {
    const id = useId();
    return (
        <Field label={label} error={error} hint={hint} className={className} id={id}>
            <textarea id={id} rows={rows} className={`field ${error ? '!border-red-700' : ''}`} aria-invalid={!!error} {...props} value={props.value ?? ''} />
        </Field>
    );
}

export function Select({ label, error, hint, className = '', children, ...props }) {
    const id = useId();
    return (
        <Field label={label} error={error} hint={hint} className={className} id={id}>
            <select id={id} className="field" aria-invalid={!!error} {...props} value={props.value ?? ''}>{children}</select>
        </Field>
    );
}

export function Toggle({ label, checked, onChange, hint }) {
    const id = useId();
    return (
        <div className="flex min-h-12 items-center justify-between gap-4">
            <label htmlFor={id} className="cursor-pointer">
                <span className="block text-sm">{label}</span>
                {hint && <span className="block text-xs text-muted">{hint}</span>}
            </label>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={!!checked}
                onClick={() => onChange(!checked)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-ink' : 'bg-line'}`}
            >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-paper shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
            </button>
        </div>
    );
}

export function Badge({ children, tone = 'neutral' }) {
    const tones = {
        neutral: 'bg-soft text-ink',
        success: 'bg-emerald-50 text-emerald-800',
        warning: 'bg-amber-50 text-amber-800',
        dark: 'bg-ink text-champagne',
        muted: 'bg-soft text-muted',
    };
    return <span className={`inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${tones[tone]}`}>{children}</span>;
}

export function IconButton({ icon, label, className = '', ...props }) {
    return (
        <button type="button" aria-label={label} title={label} className={`flex h-11 w-11 shrink-0 items-center justify-center text-lg text-ink/70 transition-colors hover:bg-soft hover:text-ink ${className}`} {...props}>
            <Icon name={icon} />
        </button>
    );
}

export function Modal({ open, onClose, title, children, footer, wide = false }) {
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
            <button className="animate-fade absolute inset-0 bg-ink/40" onClick={onClose} aria-label="Fechar" tabIndex={-1} />
            <div className={`animate-rise relative flex max-h-[92vh] w-full flex-col bg-paper shadow-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}>
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
                    <h2 className="text-2xl">{title}</h2>
                    <IconButton icon="close" label="Fechar" onClick={onClose} className="-mr-3" />
                </div>
                <div className="flex-1 overflow-y-auto p-5">{children}</div>
                {footer && <div className="pb-safe flex shrink-0 justify-end gap-2 border-t border-line p-4">{footer}</div>}
            </div>
        </div>
    );
}

/** Botão com confirmação em modal (sem alert do navegador). */
export function ConfirmButton({ onConfirm, title = 'Tem certeza?', message, confirmLabel = 'Excluir', children, className = '', icon, label }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            {icon ? (
                <IconButton icon={icon} label={label} onClick={() => setOpen(true)} className={className} />
            ) : (
                <button type="button" onClick={() => setOpen(true)} className={className}>{children}</button>
            )}
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={title}
                footer={
                    <>
                        <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancelar</button>
                        <button type="button" className="btn btn-solid !bg-red-800 !border-red-800" onClick={() => { setOpen(false); onConfirm(); }}>{confirmLabel}</button>
                    </>
                }
            >
                <p className="text-sm text-muted">{message ?? 'Esta ação não pode ser desfeita.'}</p>
            </Modal>
        </>
    );
}

// ---------- Drag and drop ----------

function SortableItem({ id, children, handle = true }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, position: 'relative' };
    const dragHandle = (
        <button type="button" className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center text-lg text-muted active:cursor-grabbing" aria-label="Arrastar para reordenar" {...attributes} {...listeners}>
            <Icon name="drag" />
        </button>
    );
    return (
        <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-80 shadow-lg' : ''}>
            {children(handle ? dragHandle : null)}
        </div>
    );
}

/** Lista reordenável (arrastar e soltar, mouse/toque/teclado). */
export function SortableList({ items, onReorder, children, grid = false, className = '' }) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const from = items.findIndex((i) => i.id === active.id);
        const to = items.findIndex((i) => i.id === over.id);
        onReorder(arrayMove(items, from, to));
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={grid ? rectSortingStrategy : verticalListSortingStrategy}>
                <div className={className}>
                    {items.map((item) => (
                        <SortableItem key={item.id} id={item.id}>{(handle) => children(item, handle)}</SortableItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

// ---------- Imagens ----------

/** Editor de recorte: o usuário escolhe o enquadramento na proporção definida. */
export function CropModal({ file, aspect, onCancel, onConfirm, title = 'Ajustar enquadramento', confirmLabel = 'Usar este recorte', extra }) {
    const [url, setUrl] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState(null);

    useEffect(() => {
        if (!file) return;
        const u = URL.createObjectURL(file);
        setUrl(u);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        return () => URL.revokeObjectURL(u);
    }, [file]);

    const onComplete = useCallback((_, pixels) => setArea(pixels), []);

    return (
        <Modal
            open={!!file}
            onClose={onCancel}
            title={title}
            wide
            footer={
                <>
                    <button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button>
                    <button type="button" className="btn btn-solid" disabled={!area} onClick={() => onConfirm(area)}>
                        <Icon name="crop" /> {confirmLabel}
                    </button>
                </>
            }
        >
            <div className="relative h-[55vh] min-h-72 bg-ink">
                {url && (
                    <Cropper image={url} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete} objectFit="contain" showGrid />
                )}
            </div>
            <div className="mt-4 flex items-center gap-3">
                <Icon name="image" className="text-muted" />
                <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-[var(--brand-ink)]" aria-label="Zoom" />
                <Icon name="zoom" className="text-muted" />
            </div>
            <p className="mt-2 text-xs text-muted">Arraste para enquadrar. A imagem final terá exatamente esta proporção, sem distorção.</p>
            {extra}
        </Modal>
    );
}

/** Seleção de uma imagem única com prévia (logo, categoria, banner, avatar). */
export function ImagePicker({ label, current, onFile, onRemove, aspect, hint, error, accept = 'image/jpeg,image/png,image/webp', crop = true, contain = false }) {
    const id = useId();
    const [pending, setPending] = useState(null);
    const [preview, setPreview] = useState(null);

    const choose = (file) => {
        if (!file) return;
        if (crop && aspect) setPending(file);
        else {
            setPreview(URL.createObjectURL(file));
            onFile(file, null);
        }
    };

    const shown = preview ?? current;

    return (
        <Field label={label} hint={hint} error={error} id={id}>
            <div className="flex items-center gap-4">
                <div className="flex w-28 shrink-0 items-center justify-center overflow-hidden border border-line bg-soft" style={{ aspectRatio: aspect || 1 }}>
                    {shown ? <img src={shown} alt="" className={`h-full w-full ${contain ? 'object-contain p-2' : 'object-cover'}`} /> : <Icon name="image" className="text-2xl text-muted" />}
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor={id} className="btn btn-outline btn-sm cursor-pointer">
                        <Icon name="upload" /> {shown ? 'Trocar' : 'Enviar'}
                    </label>
                    <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => { choose(e.target.files?.[0]); e.target.value = ''; }} />
                    {shown && onRemove && (
                        <button type="button" onClick={() => { setPreview(null); onRemove(); }} className="text-left text-xs text-muted underline underline-offset-4 hover:text-ink">Remover</button>
                    )}
                </div>
            </div>
            <CropModal
                file={pending}
                aspect={aspect}
                onCancel={() => setPending(null)}
                onConfirm={(area) => {
                    setPreview(URL.createObjectURL(pending));
                    onFile(pending, area);
                    setPending(null);
                }}
            />
        </Field>
    );
}

export function Stat({ label, value, icon, href }) {
    const body = (
        <div className="card flex items-start justify-between p-4 md:p-5">
            <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
                <p className="mt-2 font-serif text-4xl leading-none">{value}</p>
            </div>
            {icon && <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-lg"><Icon name={icon} /></span>}
        </div>
    );
    return href ? <Link href={href} className="block transition-transform hover:-translate-y-0.5">{body}</Link> : body;
}

export const STATUS = {
    draft: ['Rascunho', 'muted'],
    active: ['Ativo', 'success'],
    sold_out: ['Esgotado', 'warning'],
    archived: ['Arquivado', 'neutral'],
};

/** Converte "1:1" etc. em número para o cropper. */
export function ratioOf(r) {
    const [w, h] = String(r || '4:5').split(':').map(Number);
    return (w || 4) / (h || 5);
}
