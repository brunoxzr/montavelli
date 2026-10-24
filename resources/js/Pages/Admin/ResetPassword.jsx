import { useForm } from '@inertiajs/react';
import AuthShell from '../../Components/Admin/AuthShell';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({ token, email, password: '', password_confirmation: '' });

    return (
        <AuthShell title="Nova senha" subtitle="Mínimo de 8 caracteres, com letras e números.">
            <form onSubmit={(e) => { e.preventDefault(); post('/admin/redefinir-senha'); }} className="space-y-5">
                <div>
                    <label className="label" htmlFor="email">E-mail</label>
                    <input id="email" type="email" className="field" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                    {errors.email && <p className="mt-1.5 text-xs text-red-700">{errors.email}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="password">Nova senha</label>
                    <input id="password" type="password" autoComplete="new-password" className="field" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                    {errors.password && <p className="mt-1.5 text-xs text-red-700">{errors.password}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="password_confirmation">Confirmar senha</label>
                    <input id="password_confirmation" type="password" autoComplete="new-password" className="field" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required />
                </div>
                <button className="btn btn-solid w-full" disabled={processing}>Salvar nova senha</button>
            </form>
        </AuthShell>
    );
}
