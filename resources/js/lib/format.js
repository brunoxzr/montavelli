/** Formata preço conforme as configurações de moeda. */
export function formatPrice(value, site) {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    if (Number.isNaN(n)) return null;
    const dec = site?.decimal_separator ?? ',';
    const thou = site?.thousands_separator ?? '.';
    const [int, frac] = n.toFixed(2).split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, thou);
    return `${site?.currency_symbol ?? 'R$'} ${grouped}${dec}${frac}`;
}

export function instagramHandle(handle) {
    return handle ? handle.replace(/^@/, '') : null;
}

export function instagramUrl(handle) {
    const h = instagramHandle(handle);
    return h ? `https://instagram.com/${h}` : null;
}

export function whatsappUrl(number) {
    const n = (number || '').replace(/\D/g, '');
    return n ? `https://wa.me/${n}` : null;
}

/** Proporção "4:5" -> "4 / 5" para CSS aspect-ratio. */
export function aspect(ratio) {
    const [w, h] = String(ratio || '4:5').split(':');
    return `${w || 4} / ${h || 5}`;
}

export function ratioNumber(ratio) {
    const [w, h] = String(ratio || '4:5').split(':').map(Number);
    return (w || 4) / (h || 5);
}

/** POST JSON com CSRF (para endpoints que devolvem JSON). */
export async function postJson(url, body) {
    const token = decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': token },
        body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
}
