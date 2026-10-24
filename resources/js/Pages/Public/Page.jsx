import { Head } from '@inertiajs/react';

export default function Page({ page }) {
    return (
        <article className="container-page max-w-2xl py-12 md:py-20">
            <Head title={page.title} />
            <header className="text-center">
                <div className="divider-ornament text-champagne"><span className="eyebrow text-muted">Montavelli</span></div>
                <h1 className="mt-4 text-4xl md:text-5xl">{page.title}</h1>
            </header>
            {/* conteúdo sanitizado no servidor (allowlist de tags) */}
            <div className="prose-page mt-10 text-[15px] leading-relaxed text-ink/85" dangerouslySetInnerHTML={{ __html: page.content }} />
        </article>
    );
}
