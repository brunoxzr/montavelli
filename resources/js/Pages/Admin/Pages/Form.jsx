import { Head, router, useForm } from '@inertiajs/react';
import { Card, ConfirmButton, Input, PageHeader, Textarea, Toggle } from '../../../Components/Admin/ui';
import RichEditor from '../../../Components/Admin/RichEditor';
import Icon from '../../../Components/Icon';

export default function PageForm({ page }) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        content: page?.content ?? '',
        is_active: page?.is_active ?? true,
        show_in_footer: page?.show_in_footer ?? true,
        seo_title: page?.seo_title ?? '',
        seo_description: page?.seo_description ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        page ? put(`/admin/paginas/${page.id}`, { preserveScroll: true }) : post('/admin/paginas');
    };

    return (
        <>
            <Head title={page ? page.title : 'Nova página'} />
            <PageHeader title={page ? page.title : 'Nova página'} back="/admin/paginas">
                {page?.is_active && <a href={`/${page.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm"><Icon name="external" /> Ver na loja</a>}
            </PageHeader>

            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
                <Card>
                    <div className="space-y-4">
                        <Input label="Título" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} />
                        <RichEditor value={data.content} onChange={(v) => setData('content', v)} />
                        {errors.content && <p className="text-xs text-red-700">{errors.content}</p>}
                    </div>
                </Card>
                <div className="space-y-4 lg:sticky lg:top-6">
                    <Card title="Publicação">
                        <Input label="Endereço" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} hint="Vazio = gerado a partir do título." />
                        <div className="mt-2">
                            <Toggle label="Publicada" checked={data.is_active} onChange={(v) => setData('is_active', v)} />
                            <Toggle label="Mostrar no rodapé" checked={data.show_in_footer} onChange={(v) => setData('show_in_footer', v)} />
                        </div>
                        <button className="btn btn-solid mt-4 w-full" disabled={processing}>Salvar</button>
                    </Card>
                    <Card title="SEO">
                        <div className="space-y-4">
                            <Input label="Título" value={data.seo_title} onChange={(e) => setData('seo_title', e.target.value)} error={errors.seo_title} maxLength={70} />
                            <Textarea label="Descrição" rows={3} value={data.seo_description} onChange={(e) => setData('seo_description', e.target.value)} error={errors.seo_description} maxLength={320} />
                        </div>
                    </Card>
                    {page && (
                        <ConfirmButton className="flex min-h-11 w-full items-center justify-center gap-2 text-xs uppercase tracking-[0.14em] text-red-800 hover:bg-red-50" title="Excluir página?" onConfirm={() => router.delete(`/admin/paginas/${page.id}`)}>
                            <Icon name="delete" /> Excluir página
                        </ConfirmButton>
                    )}
                </div>
            </form>
        </>
    );
}
