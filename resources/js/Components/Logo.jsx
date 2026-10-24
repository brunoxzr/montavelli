import { usePage } from '@inertiajs/react';

/**
 * Logo oficial (ou a enviada no admin).
 * variant: "full" (coroa + M + nome), "wordmark" (só o nome), "monogram" (coroa + M)
 * tone: "ink" (sobre fundo claro) | "champagne" (sobre fundo escuro)
 */
export default function Logo({ variant = 'wordmark', tone = 'ink', className = '' }) {
    const { site } = usePage().props;
    const logo = site.logo;
    const light = tone === 'champagne';

    let src;
    if (variant === 'full') src = light ? logo.champagne : logo.ink;
    else if (variant === 'monogram') src = light ? logo.monogramLight : logo.monogram;
    else src = (light ? logo.wordmarkLight : logo.wordmark) ?? (light ? logo.champagne : logo.ink);

    return <img src={src} alt={site.store_name} className={`block h-auto select-none ${className}`} draggable="false" />;
}
