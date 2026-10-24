import { Head, Link } from '@inertiajs/react';

const TEXTS = {
    403: ['Acesso restrito', 'Você não tem permissão para ver esta página.'],
    404: ['Página não encontrada', 'O endereço pode ter mudado ou a peça não está mais disponível.'],
    500: ['Algo deu errado', 'Tente novamente em alguns instantes.'],
    503: ['Voltamos em breve', 'Estamos em manutenção.'],
};

export default function Error({ status }) {
    const [title, text] = TEXTS[status] ?? TEXTS[500];
    return (
        <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
            <Head title={title} />
            <p className="font-serif text-7xl text-champagne">{status}</p>
            <h1 className="mt-4 text-3xl md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-sm text-sm text-muted">{text}</p>
            <div className="mt-8 flex gap-3">
                <Link href="/" className="btn btn-solid">Ir para o início</Link>
                <Link href="/produtos" className="btn btn-outline">Ver produtos</Link>
            </div>
        </section>
    );
}
