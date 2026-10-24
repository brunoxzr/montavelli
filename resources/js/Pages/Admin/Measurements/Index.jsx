import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ConfirmButton, IconButton, Input, Modal, PageHeader } from '../../../Components/Admin/ui';
import Icon from '../../../Components/Icon';

const EMPTY = { columns: [''], rows: [{ label: '', values: [''] }] };

function TableEditor({ table, onClose }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: table?.name ?? '',
        content: table?.content ?? EMPTY,
    });
    const c = data.content;
    const set = (content) => setData('content', content);

    const addColumn = () => set({ columns: [...c.columns, ''], rows: c.rows.map((r) => ({ ...r, values: [...r.values, ''] })) });
    const removeColumn = (i) => set({ columns: c.columns.filter((_, j) => j !== i), rows: c.rows.map((r) => ({ ...r, values: r.values.filter((_, j) => j !== i) })) });
    const addRow = () => set({ ...c, rows: [...c.rows, { label: '', values: c.columns.map(() => '') }] });
    const removeRow = (i) => set({ ...c, rows: c.rows.filter((_, j) => j !== i) });

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onClose };
        table ? put(`/admin/medidas/${table.id}`, opts) : post('/admin/medidas', opts);
    };
    const anyError = Object.keys(errors).some((k) => k.startsWith('content'));

    return (
        <Modal open wide onClose={onClose} title={table ? 'Editar tabela' : 'Nova tabela de medidas'}
            footer={<><button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button><button form="mt-form" className="btn btn-solid" disabled={processing}>Salvar</button></>}>
            <form id="mt-form" onSubmit={submit}>
                <Input label="Nome da tabela" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} placeholder="Ex.: Camisas" />
                <p className="label mt-6">Medidas</p>
                <div className="overflow-x-auto border border-line">
                    <table className="w-full min-w-max text-sm">
                        <thead className="bg-soft">
                            <tr>
                                <th className="w-24 p-2 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-muted">Tamanho</th>
                                {c.columns.map((col, i) => (
                                    <th key={i} className="p-2">
                                        <div className="flex items-center gap-1">
                                            <input className="field !min-h-10 min-w-24" placeholder="Ex.: Busto (cm)" value={col} aria-label={`Coluna ${i + 1}`}
                                                onChange={(e) => set({ ...c, columns: c.columns.map((x, j) => (j === i ? e.target.value : x)) })} />
                                            {c.columns.length > 1 && <IconButton icon="close" label="Remover coluna" onClick={() => removeColumn(i)} className="!h-9 !w-9 text-base" />}
                                        </div>
                                    </th>
                                ))}
                                <th className="p-2"><IconButton icon="plus" label="Adicionar coluna" onClick={addColumn} className="border border-line" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {c.rows.map((row, r) => (
                                <tr key={r} className="border-t border-line">
                                    <td className="p-2"><input className="field !min-h-10" placeholder="P" value={row.label} aria-label={`Tamanho da linha ${r + 1}`}
                                        onChange={(e) => set({ ...c, rows: c.rows.map((x, j) => (j === r ? { ...x, label: e.target.value } : x)) })} /></td>
                                    {c.columns.map((_, i) => (
                                        <td key={i} className="p-2"><input className="field !min-h-10" value={row.values[i] ?? ''} aria-label={`Valor ${r + 1}-${i + 1}`}
                                            onChange={(e) => set({ ...c, rows: c.rows.map((x, j) => (j === r ? { ...x, values: c.columns.map((__, k) => (k === i ? e.target.value : x.values[k] ?? '')) } : x)) })} /></td>
                                    ))}
                                    <td className="p-2">{c.rows.length > 1 && <IconButton icon="delete" label="Remover linha" onClick={() => removeRow(r)} />}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button type="button" onClick={addRow} className="btn btn-outline btn-sm mt-3"><Icon name="plus" /> Adicionar tamanho</button>
                {anyError && <p className="mt-3 text-xs text-red-700">Preencha os nomes das colunas e os tamanhos.</p>}
            </form>
        </Modal>
    );
}

export default function Measurements({ tables }) {
    const [editing, setEditing] = useState(null);
    return (
        <>
            <Head title="Tabelas de medidas" />
            <PageHeader title="Tabelas de medidas" subtitle="Crie uma vez e vincule a produtos ou categorias.">
                <button className="btn btn-solid" onClick={() => setEditing('new')}><Icon name="plus" /> Nova tabela</button>
            </PageHeader>

            {tables.length === 0 ? (
                <div className="card flex flex-col items-center px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne text-2xl"><Icon name="ruler" /></span>
                    <p className="mt-4 font-serif text-2xl">Nenhuma tabela ainda</p>
                    <p className="mt-1 text-sm text-muted">As tabelas aparecem na página do produto, na seção Medidas.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {tables.map((t) => (
                        <article key={t.id} className="card p-4">
                            <div className="flex items-center gap-2">
                                <h2 className="flex-1 text-xl">{t.name}</h2>
                                <IconButton icon="edit" label="Editar" onClick={() => setEditing(t)} />
                                <ConfirmButton icon="delete" label="Excluir" title={`Excluir "${t.name}"?`} message="Produtos e categorias vinculados deixarão de exibir esta tabela." onConfirm={() => router.delete(`/admin/medidas/${t.id}`, { preserveScroll: true })} />
                            </div>
                            <div className="mt-3 overflow-x-auto">
                                <table className="w-full min-w-max text-xs">
                                    <thead><tr className="border-b border-ink"><th className="py-1.5 pr-3 text-left font-medium">Tam.</th>{t.content.columns.map((c) => <th key={c} className="py-1.5 pr-3 text-left font-medium">{c}</th>)}</tr></thead>
                                    <tbody>{t.content.rows.map((r) => <tr key={r.label} className="border-b border-line"><th className="py-1.5 pr-3 text-left font-medium">{r.label}</th>{r.values.map((v, i) => <td key={i} className="py-1.5 pr-3">{v}</td>)}</tr>)}</tbody>
                                </table>
                            </div>
                        </article>
                    ))}
                </div>
            )}
            {editing && <TableEditor table={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
        </>
    );
}
