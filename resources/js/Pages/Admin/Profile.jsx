import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, Input, PageHeader } from '../../Components/Admin/ui';

export default function Profile() {
    const { auth } = usePage().props;
    const { data, setData, put, processing, errors, reset } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/conta', { preserveScroll: true, onSuccess: () => reset('current_password', 'password', 'password_confirmation') });
    };

    return (
        <>
            <Head title="Minha conta" />
            <PageHeader title="Minha conta" subtitle="Altere seu nome, e-mail e senha." />
            <form onSubmit={submit} className="max-w-2xl space-y-4">
                <Card title="Dados">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Nome" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} autoComplete="name" />
                        <Input label="E-mail" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} autoComplete="email" />
                    </div>
                </Card>
                <Card title="Nova senha" description="Deixe em branco para manter a atual.">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Nova senha" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} autoComplete="new-password" />
                        <Input label="Confirmar nova senha" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                    </div>
                </Card>
                <Card>
                    <Input label="Senha atual (para confirmar)" type="password" value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} error={errors.current_password} autoComplete="current-password" />
                    <button className="btn btn-solid mt-5 w-full sm:w-auto" disabled={processing}>Salvar alterações</button>
                </Card>
            </form>
        </>
    );
}
