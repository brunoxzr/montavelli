import { usePage } from '@inertiajs/react';
import Icon from './Icon';

export default function EmptyState({ title, children, icon, action }) {
    const { site } = usePage().props;

    return (
        <div className="flex flex-col items-center bg-soft px-6 py-16 text-center sm:py-20">
            {icon ? (
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne text-2xl text-ink/70">
                    <Icon name={icon} />
                </span>
            ) : (
                <img src={site.logo.monogram} alt="" className="w-10 opacity-60" />
            )}
            <p className="mt-5 font-serif text-2xl sm:text-3xl">{title}</p>
            {children && <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{children}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
