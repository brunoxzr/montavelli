import { Link } from '@inertiajs/react';
import Icon from './Icon';

export default function SectionTitle({ eyebrow, title, href, linkLabel = 'Ver tudo', center = false }) {
    return (
        <div className={`mb-8 flex items-end gap-4 ${center ? 'flex-col items-center text-center' : 'justify-between'}`}>
            <div>
                {eyebrow && <p className="eyebrow text-muted">{eyebrow}</p>}
                <h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2>
            </div>
            {href && (
                <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 py-2 text-[12px] uppercase tracking-[0.16em]">
                    {linkLabel}
                    <Icon name="arrow-right" className="transition-transform group-hover:translate-x-0.5" />
                </Link>
            )}
        </div>
    );
}
