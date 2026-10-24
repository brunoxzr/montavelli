import { useEffect, useRef } from 'react';
import Icon from '../Icon';

/** Editor simples (negrito, itálico, títulos, listas, citação, link). O HTML é sanitizado no servidor. */
const TOOLS = [
    ['bold', 'bold', 'Negrito'],
    ['italic', 'italic', 'Itálico'],
    ['formatBlock:h2', 'h2', 'Título'],
    ['formatBlock:h3', 'h3', 'Subtítulo'],
    ['insertUnorderedList', 'list-ul', 'Lista'],
    ['insertOrderedList', 'list-ol', 'Lista numerada'],
    ['formatBlock:blockquote', 'quote', 'Citação'],
    ['createLink', 'link', 'Link'],
    ['unlink', 'link-unlink', 'Remover link'],
];

export default function RichEditor({ value, onChange, label = 'Conteúdo' }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || '';
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const run = (cmd) => {
        ref.current.focus();
        const [name, arg] = cmd.split(':');
        if (name === 'createLink') {
            const url = window.prompt('Endereço do link (https://...)');
            if (!url) return;
            document.execCommand('createLink', false, url);
        } else {
            document.execCommand(name, false, arg ? `<${arg}>` : undefined);
        }
        onChange(ref.current.innerHTML);
    };

    return (
        <div>
            <p className="label">{label}</p>
            <div className="border border-line focus-within:border-ink">
                <div className="sticky top-14 z-10 flex flex-wrap gap-0.5 border-b border-line bg-soft p-1 lg:top-0" role="toolbar" aria-label="Formatação">
                    {TOOLS.map(([cmd, icon, title]) => (
                        <button key={cmd} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(cmd)} title={title} aria-label={title}
                            className="flex h-10 w-10 items-center justify-center text-lg hover:bg-paper">
                            <Icon name={icon} />
                        </button>
                    ))}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run('formatBlock:p')} className="flex h-10 items-center px-3 text-xs hover:bg-paper">Parágrafo</button>
                </div>
                <div
                    ref={ref}
                    contentEditable
                    suppressContentEditableWarning
                    role="textbox"
                    aria-multiline="true"
                    aria-label={label}
                    onInput={(e) => onChange(e.currentTarget.innerHTML)}
                    onPaste={(e) => {
                        // cola como texto puro (evita estilos externos)
                        e.preventDefault();
                        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
                    }}
                    className="prose-page min-h-80 px-4 py-3 text-[15px] leading-relaxed outline-none"
                />
            </div>
        </div>
    );
}
