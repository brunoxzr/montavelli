import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthShell from '../../Components/Admin/AuthShell';
import Icon from '../../Components/Icon';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: false });
    const [show, setShow] = useState(false);

    return (
        <AuthShell title="Entrar">
            <form onSubmit={(e) => { e.preventDefault(); post('/admin/login', { onFinish: () => setData('password', '') }); }} className="space-y-5" noValidate>
                <div>
                    <label className="label" htmlFor="email">E-mail</label>
                    <input id="email" type="email" inputMode="email" autoComplete="username" autoFocus className="field" value={data.email} onChange={(e) => setData('email', e.target.value)} required aria-invalid={!!errors.email} />
                    {errors.email && <p className="mt-1.5 text-xs text-red-700" role="alert">{errors.email}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="password">Senha</label>
                    <div className="relative">
                        <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" className="field pr-12" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                        <button type="button" onClick={() => setShow(!show)} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-lg text-muted" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
                            <Icon name={show ? 'eye-off' : 'eye'} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
                        <input type="checkbox" className="h-5 w-5 accent-[var(--brand-ink)]" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                        Lembrar de mim
                    </label>
                    <Link href="/admin/esqueci-senha" className="text-xs text-muted underline underline-offset-4 hover:text-ink">Esqueci a senha</Link>
                </div>
                <button className="btn btn-solid w-full" disabled={processing}>
                    {processing ? 'Entrando…' : 'Entrar'}
                </button>
                <p className="flex items-center justify-center gap-1.5 pt-2 text-xs text-muted"><Icon name="lock" /> Acesso restrito a administradores</p>
            </form>
        </AuthShell>
    );
}
