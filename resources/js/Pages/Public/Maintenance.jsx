import { Head, usePage } from '@inertiajs/react';
import Logo from '../../Components/Logo';
import Icon from '../../Components/Icon';
import { instagramHandle, instagramUrl } from '../../lib/format';

export default function Maintenance() {
    const { site } = usePage().props;
    const insta = instagramUrl(site.instagram);
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-champagne">
            <Head title="Voltamos em breve" />
            <Logo variant="full" tone="champagne" className="w-56 sm:w-64" />
            <p className="mt-12 font-serif text-3xl italic text-paper">Voltamos em breve.</p>
            <p className="eyebrow mt-3 !text-[10px] text-champagne/70">Estamos preparando novidades</p>
            {insta && (
                <a href={insta} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light mt-10">
                    <Icon name="instagram" className="text-base" /> @{instagramHandle(site.instagram)}
                </a>
            )}
        </main>
    );
}
