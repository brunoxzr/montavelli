import { Link, useForm } from '@inertiajs/react';
import AuthShell from '../../Components/Admin/AuthShell';
import Icon from '../../Components/Icon';

export default function ForgotPassword({ enabled }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    return (
        <AuthShell title="Recuperar senha" subtitle={enabled ? 'Enviaremos um link para redefinir sua senha.' : null}>
            {enabled ? (
                <form onSubmit={(e) => { e.preventDefault(); post('/admin/esqueci-senha'); }} className="space-y-5">
                    <div>
                        <label className="label" htmlFor="email">E-mail</label>
                        <input id="email" type="email" autoComplete="username" className="field" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                        {errors.email && <p className="mt-1.5 text-xs text-red-700">{errors.email}</p>}
                    </div>
                    <button className="btn btn-solid w-full" disabled={processing}>Enviar link</button>
                </form>
            ) : (
                <div className="flex gap-3 bg-soft p-4 text-sm text-muted">
                    <Icon name="info" className="mt-0.5 text-lg text-ink" />
                    <p>A recuperação por e-mail ainda não foi configurada (SMTP). Outro administrador pode redefinir sua senha, ou use o comando <code className="text-ink">php artisan montavelli:create-admin</code> no servidor.</p>
                </div>
            )}
            <Link href="/admin/login" className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
                <Icon name="arrow-left" /> Voltar ao login
            </Link>
        </AuthShell>
    );
}
