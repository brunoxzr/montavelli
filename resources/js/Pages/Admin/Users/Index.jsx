import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Badge, ConfirmButton, IconButton, Input, Modal, PageHeader, Toggle } from '../../../Components/Admin/ui';
import Icon from '../../../Components/Icon';

function UserForm({ user, onClose }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        is_active: user?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onClose };
        user ? put(`/admin/usuarios/${user.id}`, opts) : post('/admin/usuarios', opts);
    };

    return (
        <Modal open onClose={onClose} title={user ? 'Editar administrador' : 'Novo administrador'}
            footer={<><button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button><button form="user-form" className="btn btn-solid" disabled={processing}>Salvar</button></>}>
            <form id="user-form" onSubmit={submit} className="space-y-4">
                <Input label="Nome" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} />
                <Input label="E-mail" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <Input label={user ? 'Nova senha (opcional)' : 'Senha'} type="password" autoComplete="new-password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} hint="Mínimo de 8 caracteres, com letras e números." />
                <Input label="Confirmar senha" type="password" autoComplete="new-password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                <Toggle label="Acesso ativo" hint="Administradores inativos não conseguem entrar." checked={data.is_active} onChange={(v) => setData('is_active', v)} />
            </form>
        </Modal>
    );
}

export default function Users({ users }) {
    const { auth } = usePage().props;
    const [editing, setEditing] = useState(null);

    return (
        <>
            <Head title="Administradores" />
            <PageHeader title="Administradores" subtitle="Quem pode acessar este painel.">
                <button className="btn btn-solid" onClick={() => setEditing('new')}><Icon name="plus" /> Adicionar</button>
            </PageHeader>

            <ul className="card divide-y divide-line">
                {users.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 p-3 md:p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm uppercase text-champagne">{u.name[0]}</span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{u.name} {u.id === auth.user.id && <span className="font-normal text-muted">(você)</span>}</p>
                            <p className="truncate text-xs text-muted">{u.email}</p>
                        </div>
                        {!u.is_active && <Badge tone="muted">Inativo</Badge>}
                        <IconButton icon="edit" label="Editar" onClick={() => setEditing(u)} />
                        {u.id !== auth.user.id && (
                            <ConfirmButton icon="delete" label="Excluir" title="Excluir administrador?" message={`${u.email} perderá o acesso ao painel.`} onConfirm={() => router.delete(`/admin/usuarios/${u.id}`, { preserveScroll: true })} />
                        )}
                    </li>
                ))}
            </ul>

            {editing && <UserForm user={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
        </>
    );
}
