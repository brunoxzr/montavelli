import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, ImagePicker, Input, PageHeader, Select, SortableList, Textarea, Toggle } from '../../Components/Admin/ui';
import Icon, { BADGE_ICONS } from '../../Components/Icon';

const TABS = [
    ['geral', 'Geral', 'store'],
    ['whatsapp', 'WhatsApp', 'whatsapp'],
    ['aparencia', 'Aparência', 'palette'],
    ['home', 'Home e selos', 'layout'],
    ['imagens', 'Imagens', 'image'],
    ['rodape', 'Rodapé', 'page'],
    ['seo', 'SEO e scripts', 'search'],
    ['email', 'E-mail (SMTP)', 'mail'],
    ['moeda', 'Moeda', 'card'],
    ['sistema', 'Manutenção', 'tool'],
];

const SECTION_NAMES = {
    banners: 'Banners', intro: 'Abertura com logo e bio', badges: 'Selos de confiança',
    categories: 'Categorias', featured: 'Produtos em destaque', latest: 'Novidades',
};

const pick = (values, keys) => Object.fromEntries(keys.map((k) => [k, values[k] ?? '']));

function Save({ processing, isDirty = true }) {
    return (
        <div className="pb-safe sticky bottom-0 z-20 -mx-4 mt-6 flex justify-end border-t border-line bg-paper/95 px-4 pt-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
            <button className="btn btn-solid w-full md:w-auto" disabled={processing || !isDirty}>Salvar alterações</button>
        </div>
    );
}

function useGroupForm(group, initial, opts = {}) {
    const form = useForm(initial);
    const submit = (e) => {
        e.preventDefault();
        form.post(`/admin/configuracoes/${group}`, { preserveScroll: true, forceFormData: opts.files, onSuccess: () => opts.files && form.reset(...opts.files) });
    };
    return { ...form, submit };
}

function General({ values, files }) {
    const f = useGroupForm('geral', {
        ...pick(values, ['store_name', 'tagline', 'instagram', 'contact_email']),
        logo_light: null, logo_dark: null, favicon: null,
        remove_logo_light: false, remove_logo_dark: false, remove_favicon: false,
    }, { files: ['logo_light', 'logo_dark', 'favicon'] });
    const { data, setData, errors } = f;

    return (
        <form onSubmit={f.submit} className="space-y-4">
            <Card title="Identidade">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Nome da loja" value={data.store_name} onChange={(e) => setData('store_name', e.target.value)} error={errors.store_name} />
                    <Input label="Instagram" value={data.instagram} onChange={(e) => setData('instagram', e.target.value)} error={errors.instagram} placeholder="montavelli.co" />
                    <Textarea className="md:col-span-2" label="Slogan / bio" rows={3} value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} error={errors.tagline} hint="Uma frase por linha. A primeira aparece em destaque na home." />
                    <Input label="E-mail de contato" type="email" value={data.contact_email} onChange={(e) => setData('contact_email', e.target.value)} error={errors.contact_email} hint="Opcional. Aparece no rodapé." />
                </div>
            </Card>
            <Card title="Logos" description="A logo oficial da marca já está aplicada. Envie apenas se quiser substituí-la (PNG com fundo transparente).">
                <div className="grid gap-6 md:grid-cols-3">
                    <ImagePicker label="Logo para fundo claro" current={data.remove_logo_light ? null : files.logo_light ?? '/brand/logo-ink.png'} contain crop={false} error={errors.logo_light}
                        accept="image/png,image/webp" onFile={(file) => setData((d) => ({ ...d, logo_light: file, remove_logo_light: false }))}
                        onRemove={files.logo_light ? () => setData((d) => ({ ...d, logo_light: null, remove_logo_light: true })) : undefined} />
                    <div className="[&_.bg-soft]:!bg-ink">
                        <ImagePicker label="Logo para fundo escuro" current={data.remove_logo_dark ? null : files.logo_dark ?? '/brand/logo-champagne.png'} contain crop={false} error={errors.logo_dark}
                            accept="image/png,image/webp" onFile={(file) => setData((d) => ({ ...d, logo_dark: file, remove_logo_dark: false }))}
                            onRemove={files.logo_dark ? () => setData((d) => ({ ...d, logo_dark: null, remove_logo_dark: true })) : undefined} />
                    </div>
                    <ImagePicker label="Favicon (PNG quadrado)" current={data.remove_favicon ? null : files.favicon ?? '/brand/favicon.png'} contain crop={false} error={errors.favicon}
                        accept="image/png" onFile={(file) => setData((d) => ({ ...d, favicon: file, remove_favicon: false }))}
                        onRemove={files.favicon ? () => setData((d) => ({ ...d, favicon: null, remove_favicon: true })) : undefined} />
                </div>
            </Card>
            <Save processing={f.processing} />
        </form>
    );
}

function WhatsApp({ values, variables, defaults }) {
    const f = useGroupForm('whatsapp', pick(values, ['whatsapp_number', 'whatsapp_button_label', 'whatsapp_template_product', 'whatsapp_template_bag']));
    const { data, setData, errors } = f;
    const digits = (data.whatsapp_number || '').replace(/\D/g, '');

    const insert = (field, v) => setData(field, `${data[field] || ''}{${v}}`);

    return (
        <form onSubmit={f.submit} className="space-y-4">
            <Card title="Número">
                <Input label="WhatsApp com DDI e DDD" inputMode="tel" placeholder="55 11 91234-5678" value={data.whatsapp_number} onChange={(e) => setData('whatsapp_number', e.target.value)} error={errors.whatsapp_number}
                    hint={digits ? `Link: wa.me/${digits}` : 'Sem número, os botões de pedido ficam ocultos na loja.'} />
                <Input className="mt-4" label="Texto do botão" value={data.whatsapp_button_label} onChange={(e) => setData('whatsapp_button_label', e.target.value)} error={errors.whatsapp_button_label} />
            </Card>
            <Card title="Mensagem do produto" description="Enviada ao clicar em pedir na página do produto.">
                <Textarea rows={6} value={data.whatsapp_template_product} onChange={(e) => setData('whatsapp_template_product', e.target.value)} error={errors.whatsapp_template_product} placeholder={defaults.whatsapp_template_product} hint="Vazio = modelo mostrado acima. Linhas com variáveis vazias são removidas." />
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {variables.map((v) => <button type="button" key={v} onClick={() => insert('whatsapp_template_product', v)} className="bg-soft px-2.5 py-1.5 font-mono text-xs hover:bg-champagne">{`{${v}}`}</button>)}
                </div>
            </Card>
            <Card title="Mensagem da sacola" description="Use {itens} onde a lista de peças deve aparecer.">
                <Textarea rows={5} value={data.whatsapp_template_bag} onChange={(e) => setData('whatsapp_template_bag', e.target.value)} error={errors.whatsapp_template_bag} placeholder="{itens}" hint="Vazio = só a lista de itens (quantidade, peça, tamanho, cor e preço)." />
                <button type="button" onClick={() => insert('whatsapp_template_bag', 'itens')} className="mt-3 bg-soft px-2.5 py-1.5 font-mono text-xs hover:bg-champagne">{'{itens}'}</button>
            </Card>
            <Save processing={f.processing} />
        </form>
    );
}

function Appearance({ values }) {
    const f = useGroupForm('aparencia', pick(values, ['color_black', 'color_champagne', 'color_white', 'color_offwhite', 'font_heading', 'radius', 'button_style']));
    const { data, setData, errors } = f;
    const colors = [
        ['color_black', 'Preto', 'Textos e botões'],
        ['color_champagne', 'Champagne', 'Detalhes (extraído da logo)'],
        ['color_white', 'Branco', 'Fundo'],
        ['color_offwhite', 'Off-white', 'Fundos de apoio'],
    ];
    const radius = { none: '0px', sm: '4px', md: '10px', lg: '18px' }[data.radius];

    return (
        <form onSubmit={f.submit} className="space-y-4">
            <Card title="Cores" description="Paleta derivada da logo.">
                <div className="grid gap-4 sm:grid-cols-2">
                    {colors.map(([k, label, hint]) => (
                        <div key={k}>
                            <label className="label" htmlFor={k}>{label}</label>
                            <div className="flex gap-2">
                                <label className="relative h-12 w-12 shrink-0 cursor-pointer border border-line" style={{ background: data[k] }}>
                                    <input type="color" value={data[k]} onChange={(e) => setData(k, e.target.value.toUpperCase())} className="absolute inset-0 cursor-pointer opacity-0" aria-label={label} />
                                </label>
                                <input id={k} className="field font-mono uppercase" value={data[k]} onChange={(e) => setData(k, e.target.value)} maxLength={7} />
                            </div>
                            <p className="mt-1.5 text-xs text-muted">{errors[k] ? <span className="text-red-700">{errors[k]}</span> : hint}</p>
                        </div>
                    ))}
                </div>
                <button type="button" className="mt-4 text-xs underline underline-offset-4" onClick={() => setData((d) => ({ ...d, color_black: '#0B0B0B', color_champagne: '#CCC2B4', color_white: '#FFFFFF', color_offwhite: '#F8F6F2' }))}>Restaurar cores da marca</button>
            </Card>
            <Card title="Tipografia e formas">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Select label="Fonte dos títulos" value={data.font_heading} onChange={(e) => setData('font_heading', e.target.value)}>
                        <option value="cormorant">Cormorant Garamond</option>
                        <option value="cinzel">Cinzel</option>
                    </Select>
                    <Select label="Cantos" value={data.radius} onChange={(e) => setData('radius', e.target.value)}>
                        <option value="none">Retos</option>
                        <option value="sm">Levemente arredondados</option>
                        <option value="md">Arredondados</option>
                        <option value="lg">Bem arredondados</option>
                    </Select>
                    <Select label="Botão principal" value={data.button_style} onChange={(e) => setData('button_style', e.target.value)}>
                        <option value="filled">Preenchido</option>
                        <option value="outline">Contorno</option>
                    </Select>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 p-6" style={{ background: data.color_offwhite }}>
                    <p className="text-3xl" style={{ fontFamily: data.font_heading === 'cinzel' ? 'Cinzel' : 'Cormorant Garamond', color: data.color_black }}>Prévia do título</p>
                    <span className="inline-flex min-h-12 items-center px-6 text-[13px] uppercase tracking-[0.14em]"
                        style={{ borderRadius: radius, border: `1px solid ${data.color_black}`, background: data.button_style === 'filled' ? data.color_black : 'transparent', color: data.button_style === 'filled' ? data.color_white : data.color_black }}>
                        Botão
                    </span>
                    <span className="h-12 w-12" style={{ background: data.color_champagne, borderRadius: radius }} />
                </div>
            </Card>
            <Save processing={f.processing} />
        </form>
    );
}

function Home({ values }) {
    const f = useGroupForm('home', {
        home_sections: (values.home_sections || []).map((s) => ({ ...s, title: s.title ?? '' })),
        trust_badges: values.trust_badges || [],
    });
    const { data, setData } = f;
    const sections = data.home_sections.map((s) => ({ ...s, id: s.key }));
    const setSection = (key, patch) => setData('home_sections', data.home_sections.map((s) => (s.key === key ? { ...s, ...patch } : s)));
    const setBadge = (i, patch) => setData('trust_badges', data.trust_badges.map((b, j) => (j === i ? { ...b, ...patch } : b)));
    const [iconFor, setIconFor] = useState(null);

    return (
        <form onSubmit={f.submit} className="space-y-4">
            <Card title="Seções da home" description="Arraste para ordenar; desligue para ocultar.">
                <SortableList items={sections} onReorder={(list) => setData('home_sections', list.map(({ id, ...s }) => s))} className="divide-y divide-line border border-line">
                    {(s, handle) => (
                        <div className="flex flex-wrap items-center gap-2 bg-paper py-2 pl-1 pr-3 sm:flex-nowrap">
                            {handle}
                            <span className="min-w-40 flex-1 text-sm">{SECTION_NAMES[s.key]}</span>
                            {['categories', 'featured', 'latest'].includes(s.key) && (
                                <input className="field !min-h-10 sm:!w-56" placeholder="Título (opcional)" value={s.title} onChange={(e) => setSection(s.key, { title: e.target.value })} aria-label={`Título de ${SECTION_NAMES[s.key]}`} />
                            )}
                            <Toggle label="" checked={s.active} onChange={(v) => setSection(s.key, { active: v })} />
                        </div>
                    )}
                </SortableList>
                <p className="mt-3 text-xs text-muted">Os banners são gerenciados em <Link href="/admin/banners" className="text-ink underline underline-offset-4">Banners</Link>.</p>
            </Card>

            <Card title="Selos de confiança" description="Aparecem na barra do topo, na home e na página do produto. Use apenas informações verdadeiras."
                actions={data.trust_badges.length < 6 && <button type="button" className="btn btn-outline btn-sm" onClick={() => setData('trust_badges', [...data.trust_badges, { icon: 'shield', text: '', active: true }])}><Icon name="plus" /> Adicionar</button>}>
                {data.trust_badges.length === 0 && <p className="bg-soft p-4 text-center text-sm text-muted">Nenhum selo.</p>}
                <ul className="space-y-3">
                    {data.trust_badges.map((b, i) => (
                        <li key={i} className="relative flex items-center gap-2">
                            <button type="button" onClick={() => setIconFor(iconFor === i ? null : i)} className="flex h-12 w-12 shrink-0 items-center justify-center border border-line text-xl hover:border-ink" aria-label="Escolher ícone"><Icon name={b.icon} /></button>
                            <input className="field" value={b.text} onChange={(e) => setBadge(i, { text: e.target.value })} placeholder="Ex.: Enviamos para todo o Brasil" aria-label="Texto do selo" maxLength={60} />
                            <Toggle label="" checked={b.active} onChange={(v) => setBadge(i, { active: v })} />
                            <button type="button" onClick={() => setData('trust_badges', data.trust_badges.filter((_, j) => j !== i))} className="flex h-11 w-11 shrink-0 items-center justify-center text-lg text-muted hover:text-ink" aria-label="Remover selo"><Icon name="delete" /></button>
                            {iconFor === i && (
                                <div className="absolute left-0 top-14 z-20 grid grid-cols-7 gap-1 border border-line bg-paper p-2 shadow-lg">
                                    {BADGE_ICONS.map((ic) => (
                                        <button type="button" key={ic} onClick={() => { setBadge(i, { icon: ic }); setIconFor(null); }} className={`flex h-10 w-10 items-center justify-center text-lg ${b.icon === ic ? 'bg-ink text-champagne' : 'hover:bg-soft'}`} aria-label={ic}><Icon name={ic} /></button>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {f.errors && Object.keys(f.errors).some((k) => k.startsWith('trust')) && <p className="mt-2 text-xs text-red-700">Preencha o texto de todos os selos.</p>}
            </Card>
            <Save processing={f.processing} />
        </form>
    );
}

function Images({ values }) {
    const f = useGroupForm('imagens', pick(values, ['image_ratio', 'image_quality']));
    const { data, setData } = f;
    return (
        <form onSubmit={f.submit} className="space-y-4">
            <Card title="Padrão das fotos de produto" description="Todas as fotos são recortadas nesta proporção, sem distorção. Vale para os próximos envios.">
                <div className="grid gap-6 sm:grid-cols-2">
                    <fieldset>
                        <legend className="label">Proporção</legend>
                        <div className="grid grid-cols-4 gap-2">
                            {['4:5', '3:4', '2:3', '1:1'].map((r) => {
                                const [w, h] = r.split(':');
                                return (
                                    <button type="button" key={r} onClick={() => setData('image_ratio', r)} aria-pressed={data.image_ratio === r}
                                        className={`flex flex-col items-center gap-2 border p-3 ${data.image_ratio === r ? 'border-ink bg-soft' : 'border-line'}`}>
                                        <span className="w-8 border border-ink bg-paper" style={{ aspectRatio: `${w}/${h}` }} />
                                        <span className="text-xs">{r}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-2 text-xs text-muted">Recomendado: 4:5 (retrato).</p>
                    </fieldset>
                    <div>
                        <label className="label" htmlFor="q">Qualidade: {data.image_quality}%</label>
                        <input id="q" type="range" min="50" max="95" value={data.image_quality} onChange={(e) => setData('image_quality', e.target.value)} className="w-full accent-ink" />
                        <p className="mt-2 text-xs text-muted">82% equilibra nitidez e velocidade.</p>
                    </div>
                </div>
                <div className="mt-6 bg-soft p-4 text-xs leading-relaxed text-muted">
                    Tamanhos gerados automaticamente em WebP e JPEG: miniatura (160px), card (600px), galeria (1080px) e zoom (1600px). Metadados EXIF são removidos.
                </div>
            </Card>
            <Save processing={f.processing} />
        </form>
    );
}

function Simple({ group, values, fields, title, description }) {
    const f = useGroupForm(group, pick(values, fields.map((x) => x.key)));
    const { data, setData, errors } = f;
    return (
        <form onSubmit={f.submit} className="space-y-4">
            <Card title={title} description={description}>
                <div className="grid gap-4 md:grid-cols-2">
                    {fields.map((x) => {
                        const common = { key: x.key, label: x.label, hint: x.hint, error: errors[x.key], value: data[x.key], onChange: (e) => setData(x.key, e.target.value), className: x.wide ? 'md:col-span-2' : '' };
                        if (x.type === 'textarea') return <Textarea {...common} rows={x.rows || 4} className={`md:col-span-2 ${x.mono ? '[&_textarea]:font-mono [&_textarea]:text-xs' : ''}`} />;
                        if (x.options) return <Select {...common}>{x.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>;
                        return <Input {...common} type={x.type || 'text'} autoComplete="off" />;
                    })}
                </div>
            </Card>
            <Save processing={f.processing} />
        </form>
    );
}

function System({ values }) {
    const f = useGroupForm('sistema', { maintenance: !!values.maintenance });
    return (
        <form onSubmit={f.submit} className="space-y-4">
            <Card title="Modo manutenção" description="Os visitantes veem uma página de &quot;voltamos em breve&quot;. Você, logado, continua vendo a loja normalmente.">
                <Toggle label="Ativar modo manutenção" checked={f.data.maintenance} onChange={(v) => f.setData('maintenance', v)} />
                {values.maintenance && <p className="mt-3 flex items-center gap-2 bg-amber-50 p-3 text-sm text-amber-900"><Icon name="alert" /> A loja está em manutenção agora.</p>}
            </Card>
            <Save processing={f.processing} />
        </form>
    );
}

export default function Settings({ group, values, files, whatsappVariables, defaults }) {
    const content = {
        geral: <General values={values} files={files} />,
        whatsapp: <WhatsApp values={values} variables={whatsappVariables} defaults={defaults} />,
        aparencia: <Appearance values={values} />,
        home: <Home values={values} />,
        imagens: <Images values={values} />,
        rodape: <Simple group="rodape" values={values} title="Rodapé" description="Texto livre exibido no rodapé (opcional). Instagram, WhatsApp e páginas aparecem automaticamente."
            fields={[{ key: 'footer_text', label: 'Texto do rodapé', type: 'textarea' }]} />,
        seo: <Simple group="seo" values={values} title="SEO global" description="Como a loja aparece no Google e ao compartilhar links."
            fields={[
                { key: 'seo_title', label: 'Título padrão', hint: 'Vazio = nome da loja.', wide: true },
                { key: 'seo_description', label: 'Descrição padrão', type: 'textarea', rows: 3 },
                { key: 'head_scripts', label: 'Scripts opcionais (ex.: análise de visitas)', type: 'textarea', rows: 6, mono: true, hint: 'Colado no <head> das páginas públicas. Use apenas códigos de fontes confiáveis.' },
            ]} />,
        email: <Simple group="email" values={values} title="E-mail (SMTP)" description="Usado para a recuperação de senha. Opcional."
            fields={[
                { key: 'smtp_host', label: 'Servidor SMTP', hint: 'Ex.: smtp.gmail.com' },
                { key: 'smtp_port', label: 'Porta', type: 'number', hint: 'Ex.: 587' },
                { key: 'smtp_user', label: 'Usuário' },
                { key: 'smtp_password', label: 'Senha', type: 'password', hint: 'Guardada criptografada.' },
                { key: 'smtp_encryption', label: 'Criptografia', options: [['', 'Nenhuma'], ['tls', 'TLS'], ['ssl', 'SSL']] },
                { key: 'mail_from', label: 'E-mail remetente', type: 'email' },
                { key: 'mail_from_name', label: 'Nome do remetente', hint: 'Vazio = nome da loja.' },
            ]} />,
        moeda: <Simple group="moeda" values={values} title="Moeda e formato de preço"
            fields={[
                { key: 'currency_symbol', label: 'Símbolo', hint: 'Ex.: R$' },
                { key: 'decimal_separator', label: 'Separador decimal', options: [[',', 'Vírgula (1.234,56)'], ['.', 'Ponto (1,234.56)']] },
                { key: 'thousands_separator', label: 'Separador de milhar', options: [['.', 'Ponto'], [',', 'Vírgula'], [' ', 'Espaço']] },
            ]} />,
        sistema: <System values={values} />,
    }[group];

    return (
        <>
            <Head title="Configurações" />
            <PageHeader title="Configurações" />
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <nav className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Seções">
                    {TABS.map(([key, label, icon]) => (
                        <Link key={key} href={`/admin/configuracoes/${key}`} preserveScroll aria-current={group === key ? 'page' : undefined}
                            className={`flex min-h-11 shrink-0 items-center gap-2.5 px-3 text-sm ${group === key ? 'bg-ink text-paper' : 'text-ink/75 hover:bg-paper'}`}>
                            <Icon name={icon} className={group === key ? 'text-champagne' : ''} />{label}
                        </Link>
                    ))}
                </nav>
                <div className="min-w-0" key={group}>{content}</div>
            </div>
        </>
    );
}
