import { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Badge, Card, ConfirmButton, IconButton, ImagePicker, Input, Modal, PageHeader, Select, SortableList, Textarea, Toggle } from '../../../Components/Admin/ui';
import Icon from '../../../Components/Icon';
import { LinksView } from '../../Public/Links';
import { toast } from '../../../Components/Toast';

const KINDS = {
    custom: { label: 'Link personalizado', icon: 'link' },
    whatsapp: { label: 'WhatsApp (número das configurações)', icon: 'whatsapp', title: 'WhatsApp' },
    instagram: { label: 'Instagram (perfil das configurações)', icon: 'instagram', title: 'Instagram' },
    catalog: { label: 'Catálogo da loja', icon: 'store', title: 'Catálogo' },
};

function LinkForm({ link, preset, icons, onClose }) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: link?.title ?? KINDS[preset ?? 'custom'].title ?? '',
        kind: link?.kind ?? preset ?? 'custom',
        url: link?.url ?? '',
        icon: link?.icon ?? KINDS[preset ?? 'custom'].icon ?? 'link',
        is_highlighted: link?.is_highlighted ?? false,
        is_active: link?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onClose };
        link ? put(`/admin/links/${link.id}`, opts) : post('/admin/links', opts);
    };

    return (
        <Modal open onClose={onClose} title={link ? 'Editar link' : 'Novo link'}
            footer={<><button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button><button form="link-form" className="btn btn-solid" disabled={processing}>Salvar</button></>}>
            <form id="link-form" onSubmit={submit} className="space-y-4">
                <Select label="Tipo" value={data.kind} onChange={(e) => { const k = e.target.value; setData((d) => ({ ...d, kind: k, icon: KINDS[k].icon, title: d.title || KINDS[k].title || '' })); }}>
                    {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
                <Input label="Título do botão" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} />
                {data.kind === 'custom' && (
                    <Input label="Endereço" type="url" inputMode="url" placeholder="https://" value={data.url} onChange={(e) => setData('url', e.target.value)} error={errors.url} hint="Também aceita mailto:, tel: ou caminhos da loja (/produtos)." />
                )}
                <fieldset>
                    <legend className="label">Ícone</legend>
                    <div className="grid grid-cols-7 gap-1.5">
                        <button type="button" onClick={() => setData('icon', null)} aria-pressed={!data.icon} className={`flex h-11 items-center justify-center border text-xs ${!data.icon ? 'border-ink bg-ink text-paper' : 'border-line'}`}>—</button>
                        {icons.map((i) => (
                            <button type="button" key={i} onClick={() => setData('icon', i)} aria-pressed={data.icon === i} aria-label={i}
                                className={`flex h-11 items-center justify-center border text-lg ${data.icon === i ? 'border-ink bg-ink text-champagne' : 'border-line hover:border-ink'}`}>
                                <Icon name={i} />
                            </button>
                        ))}
                    </div>
                </fieldset>
                <Toggle label="Destaque" hint="Botão em champagne, chama mais atenção." checked={data.is_highlighted} onChange={(v) => setData('is_highlighted', v)} />
                <Toggle label="Ativo" checked={data.is_active} onChange={(v) => setData('is_active', v)} />
            </form>
        </Modal>
    );
}

function Appearance({ site, avatar, form }) {
    const { data, setData, post, processing, errors } = form;
    return (
        <Card title="Aparência" description="Título, descrição, foto e endereço da página.">
            <form onSubmit={(e) => { e.preventDefault(); post('/admin/links/aparencia', { forceFormData: true, preserveScroll: true }); }} className="space-y-4">
                <ImagePicker label="Foto / avatar" current={data.remove_avatar ? null : avatar} aspect={1} error={errors.avatar}
                    hint="Vazio = monograma da marca."
                    onFile={(file) => setData((d) => ({ ...d, avatar: file, remove_avatar: false }))}
                    onRemove={() => setData((d) => ({ ...d, avatar: null, remove_avatar: true }))} crop={false} />
                <Input label="Título" value={data.links_title} onChange={(e) => setData('links_title', e.target.value)} error={errors.links_title} hint="Vazio = logo da marca." />
                <Textarea label="Descrição" rows={3} value={data.links_description} onChange={(e) => setData('links_description', e.target.value)} error={errors.links_description} hint="Vazio = bio da loja." />
                <Select label="Estilo dos botões" value={data.links_button_style} onChange={(e) => setData('links_button_style', e.target.value)}>
                    <option value="filled">Preenchido (preto)</option>
                    <option value="outline">Contorno</option>
                </Select>
                <div>
                    <label className="label" htmlFor="links-path">Endereço da página</label>
                    <div className="flex items-stretch">
                        <span className="flex items-center border border-r-0 border-line bg-soft px-3 text-sm text-muted">{window.location.host}/</span>
                        <input id="links-path" className="field" value={data.links_path} onChange={(e) => setData('links_path', e.target.value.toLowerCase())} />
                    </div>
                    {errors.links_path && <p className="mt-1.5 text-xs text-red-700">{errors.links_path}</p>}
                    <p className="mt-1.5 text-xs text-muted">Endereço curto para a bio do Instagram. <span className="text-ink">/links</span> sempre funciona.</p>
                </div>
                <button className="btn btn-solid w-full" disabled={processing}>Salvar aparência</button>
            </form>
        </Card>
    );
}

export default function Links({ links, icons, avatar, publicUrl }) {
    const { site } = usePage().props;
    const [items, setItems] = useState(links);
    const [editing, setEditing] = useState(null);
    useEffect(() => setItems(links), [links]);

    const form = useForm({
        links_title: site.links_title ?? '',
        links_description: site.links_description ?? '',
        links_button_style: site.links_button_style ?? 'filled',
        links_path: site.links_path ?? 'links',
        avatar: null,
        remove_avatar: false,
    });

    // pré-visualização ao vivo com os dados do formulário
    const previewSite = { ...site, ...form.data };
    const previewAvatar = form.data.avatar ? URL.createObjectURL(form.data.avatar) : form.data.remove_avatar ? null : avatar;
    const previewLinks = items.filter((l) => l.is_active && l.resolved);

    const copy = async () => {
        await navigator.clipboard?.writeText(publicUrl);
        toast('Endereço copiado');
    };

    return (
        <>
            <Head title="Links (bio)" />
            <PageHeader title="Página de links" subtitle="Para colocar na bio do Instagram.">
                <button onClick={copy} className="btn btn-outline btn-sm"><Icon name="copy" /> Copiar endereço</button>
                <a href={publicUrl} target="_blank" rel="noopener" className="btn btn-outline btn-sm"><Icon name="external" /> Abrir</a>
            </PageHeader>

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="min-w-0 space-y-6">
                    <Card title="Links" description="Arraste para reordenar." actions={<button className="btn btn-solid btn-sm" onClick={() => setEditing({ preset: 'custom' })}><Icon name="plus" /> Novo</button>}>
                        <div className="mb-4 flex flex-wrap gap-2">
                            {['whatsapp', 'instagram', 'catalog'].filter((k) => !items.some((l) => l.kind === k)).map((k) => (
                                <button key={k} onClick={() => setEditing({ preset: k })} className="btn btn-outline btn-sm border-line">
                                    <Icon name={KINDS[k].icon} className="text-base" /> + {KINDS[k].title}
                                </button>
                            ))}
                        </div>
                        {items.length === 0 ? (
                            <p className="bg-soft p-6 text-center text-sm text-muted">Nenhum link ainda. Comece pelos atalhos acima.</p>
                        ) : (
                            <SortableList items={items} onReorder={(list) => { setItems(list); router.post('/admin/links/ordem', { ids: list.map((l) => l.id) }, { preserveScroll: true, preserveState: true }); }} className="divide-y divide-line border border-line">
                                {(l, handle) => (
                                    <div className={`flex items-center gap-2 bg-paper py-2 pl-1 pr-2 ${!l.is_active ? 'opacity-50' : ''}`}>
                                        {handle}
                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center text-lg ${l.is_highlighted ? 'bg-champagne' : 'bg-soft'}`}><Icon name={l.icon || 'link'} /></span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{l.title}</p>
                                            <p className="truncate text-xs text-muted">{l.resolved ?? <span className="text-amber-700">Configure o {KINDS[l.kind]?.title} nas configurações</span>}</p>
                                        </div>
                                        <span className="hidden items-center gap-1 text-xs tabular-nums text-muted sm:flex" title="Cliques"><Icon name="cursor" />{l.clicks_count}</span>
                                        <button onClick={() => router.put(`/admin/links/${l.id}`, { ...l, is_active: !l.is_active }, { preserveScroll: true })} className="flex h-11 w-11 items-center justify-center text-lg text-ink/70 hover:bg-soft" aria-label={l.is_active ? 'Desativar' : 'Ativar'} title={l.is_active ? 'Desativar' : 'Ativar'}>
                                            <Icon name={l.is_active ? 'eye' : 'eye-off'} />
                                        </button>
                                        <IconButton icon="edit" label="Editar" onClick={() => setEditing({ link: l })} />
                                        <ConfirmButton icon="delete" label="Excluir" title={`Excluir "${l.title}"?`} onConfirm={() => router.delete(`/admin/links/${l.id}`, { preserveScroll: true })} />
                                    </div>
                                )}
                            </SortableList>
                        )}
                    </Card>
                    <Appearance site={site} avatar={avatar} form={form} />
                </div>

                <aside className="xl:sticky xl:top-6 xl:self-start">
                    <p className="label flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Pré-visualização ao vivo</p>
                    <div className="mx-auto w-full max-w-[340px] rounded-[2.5rem] border-[10px] border-ink bg-ink shadow-xl">
                        <div className="h-[620px] overflow-y-auto rounded-[1.8rem] bg-paper">
                            <LinksView site={previewSite} links={previewLinks} avatar={previewAvatar} preview />
                        </div>
                    </div>
                </aside>
            </div>

            {editing && <LinkForm link={editing.link} preset={editing.preset} icons={icons} onClose={() => setEditing(null)} />}
        </>
    );
}
