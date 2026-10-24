import { Head, Link, router } from '@inertiajs/react';
import { Badge, ConfirmButton, PageHeader } from '../../../Components/Admin/ui';
import Icon from '../../../Components/Icon';

export default function PagesIndex({ pages }) {
    return (
        <>
            <Head title="Páginas" />
            <PageHeader title="Páginas" subtitle="Páginas livres como Sobre, Trocas ou Envios. Só existem se você criar.">
                <Link href="/admin/paginas/novo" className="btn btn-solid"><Icon name="plus" /> Nova página</Link>
            </PageHeader>

            {pages.length === 0 ? (
                <div className="card flex flex-col items-center px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne text-2xl"><Icon name="page" /></span>
                    <p className="mt-4 font-serif text-2xl">Nenhuma página</p>
                    <p className="mt-1 text-sm text-muted">Páginas ativas aparecem no rodapé da loja.</p>
                </div>
            ) : (
                <ul className="card divide-y divide-line">
                    {pages.map((p) => (
                        <li key={p.id} className="flex items-center gap-3 p-3 md:p-4">
                            <Icon name="page" className="text-xl text-muted" />
                            <div className="min-w-0 flex-1">
                                <Link href={`/admin/paginas/${p.id}/editar`} className="block truncate font-medium hover:underline">{p.title}</Link>
                                <p className="truncate text-xs text-muted">/{p.slug}</p>
                            </div>
                            {!p.is_active && <Badge tone="muted">Oculta</Badge>}
                            {p.is_active && p.show_in_footer && <Badge>Rodapé</Badge>}
                            <Link href={`/admin/paginas/${p.id}/editar`} className="flex h-11 w-11 items-center justify-center text-lg text-ink/70 hover:bg-soft" aria-label="Editar"><Icon name="edit" /></Link>
                            <ConfirmButton icon="delete" label="Excluir" title={`Excluir "${p.title}"?`} onConfirm={() => router.delete(`/admin/paginas/${p.id}`)} />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
