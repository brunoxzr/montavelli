import { Head, Link, usePage } from '@inertiajs/react';
import { Card, PageHeader, Stat } from '../../Components/Admin/ui';
import Icon from '../../Components/Icon';

const SHORTCUTS = [
    ['Novo produto', '/admin/produtos/novo', 'plus'],
    ['Categorias', '/admin/categorias', 'folder'],
    ['Links da bio', '/admin/links', 'links'],
    ['WhatsApp', '/admin/configuracoes/whatsapp', 'whatsapp'],
];

function Ranking({ title, rows, label, value, empty, icon }) {
    const max = Math.max(1, ...rows.map((r) => r[value]));
    return (
        <Card title={title}>
            {rows.length === 0 ? (
                <div className="flex items-center gap-3 py-4 text-sm text-muted"><Icon name={icon} className="text-lg" />{empty}</div>
            ) : (
                <ol className="space-y-4">
                    {rows.map((r, i) => (
                        <li key={r.id}>
                            <div className="flex items-baseline justify-between gap-3 text-sm">
                                <span className="truncate"><span className="mr-2 text-muted">{i + 1}.</span>{r[label]}</span>
                                <span className="font-medium tabular-nums">{r[value]}</span>
                            </div>
                            <div className="mt-1.5 h-1 bg-soft"><div className="h-full bg-champagne" style={{ width: `${(r[value] / max) * 100}%` }} /></div>
                        </li>
                    ))}
                </ol>
            )}
        </Card>
    );
}

export default function Dashboard({ stats, topLinks, topProducts, checklist }) {
    const { auth } = usePage().props;
    const pending = checklist.filter((c) => !c.done);
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    return (
        <>
            <Head title="Dashboard" />
            <PageHeader title={`${greet}, ${auth.user.name.split(' ')[0]}`} subtitle="Resumo da loja">
                <Link href="/admin/produtos/novo" className="btn btn-solid"><Icon name="plus" /> Novo produto</Link>
            </PageHeader>

            {pending.length > 0 && (
                <section className="mb-6 bg-ink p-5 text-paper md:p-6">
                    <div className="flex items-center gap-3">
                        <Icon name="crown" className="text-xl text-champagne" />
                        <h2 className="text-2xl">Primeiros passos</h2>
                        <span className="ml-auto text-xs text-paper/60">{checklist.length - pending.length}/{checklist.length}</span>
                    </div>
                    <div className="mt-3 h-1 bg-paper/10"><div className="h-full bg-champagne transition-all" style={{ width: `${((checklist.length - pending.length) / checklist.length) * 100}%` }} /></div>
                    <ul className="mt-4 grid gap-1 sm:grid-cols-2">
                        {checklist.map((c) => (
                            <li key={c.label}>
                                <Link href={c.href} className={`flex min-h-11 items-center gap-3 text-sm ${c.done ? 'text-paper/40 line-through' : 'hover:text-champagne'}`}>
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${c.done ? 'border-champagne bg-champagne text-ink' : 'border-paper/40'}`}>
                                        {c.done && <Icon name="check" className="text-xs" />}
                                    </span>
                                    {c.label}
                                    {!c.done && <Icon name="arrow-right" className="ml-auto text-champagne" />}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
                <Stat label="Produtos" value={stats.products} icon="shirt" href="/admin/produtos" />
                <Stat label="Ativos" value={stats.active} icon="check" href="/admin/produtos?status=active" />
                <Stat label="Esgotados" value={stats.soldOut} icon="alert" href="/admin/produtos?status=sold_out" />
                <Stat label="Rascunhos" value={stats.drafts} icon="edit" href="/admin/produtos?status=draft" />
                <Stat label="Cliques em pedir" value={stats.orderClicks} icon="whatsapp" />
                <Stat label="Cliques nos links" value={stats.linkClicks} icon="cursor" href="/admin/links" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Ranking title="Produtos mais vistos" rows={topProducts} label="name" value="views_count" icon="eye" empty="As visualizações aparecem aqui." />
                <Ranking title="Links mais clicados" rows={topLinks} label="title" value="clicks_count" icon="links" empty="Os cliques da página de links aparecem aqui." />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {SHORTCUTS.map(([label, href, icon]) => (
                    <Link key={href} href={href} className="card flex min-h-24 flex-col justify-between p-4 transition-colors hover:border-ink">
                        <Icon name={icon} className="text-xl" />
                        <span className="text-sm">{label}</span>
                    </Link>
                ))}
            </div>
        </>
    );
}
