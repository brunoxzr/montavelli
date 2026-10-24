import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Icon from './Icon';

/** Mostra as mensagens flash do servidor (e eventos "toast" do navegador). */
export default function Toast() {
    const { flash } = usePage().props;
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (flash?.success) setMsg({ type: 'success', text: flash.success, at: Date.now() });
        else if (flash?.error) setMsg({ type: 'error', text: flash.error, at: Date.now() });
    }, [flash]);

    useEffect(() => {
        const onToast = (e) => setMsg({ type: e.detail.type || 'success', text: e.detail.text, at: Date.now() });
        window.addEventListener('toast', onToast);
        return () => window.removeEventListener('toast', onToast);
    }, []);

    useEffect(() => {
        if (!msg) return;
        const t = setTimeout(() => setMsg(null), 3500);
        return () => clearTimeout(t);
    }, [msg]);

    if (!msg) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-8" role="status" aria-live="polite">
            <div className={`animate-rise pointer-events-auto flex max-w-md items-center gap-3 px-5 py-3.5 text-sm shadow-lg ${msg.type === 'error' ? 'bg-red-800 text-white' : 'bg-ink text-paper'}`}>
                <Icon name={msg.type === 'error' ? 'alert' : 'check'} className="text-base text-champagne" />
                <span>{msg.text}</span>
                <button onClick={() => setMsg(null)} className="ml-2 opacity-70 hover:opacity-100" aria-label="Fechar">
                    <Icon name="close" />
                </button>
            </div>
        </div>
    );
}

export function toast(text, type = 'success') {
    window.dispatchEvent(new CustomEvent('toast', { detail: { text, type } }));
}
