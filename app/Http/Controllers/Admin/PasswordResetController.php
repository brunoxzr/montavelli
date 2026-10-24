<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Inertia\Inertia;
use Inertia\Response;

/** Recuperação de senha opcional: só funciona com SMTP configurado no admin. */
class PasswordResetController extends Controller
{
    public function create(SettingsService $settings): Response
    {
        return Inertia::render('Admin/ForgotPassword', ['enabled' => (bool) $settings->get('smtp_host')]);
    }

    public function store(Request $request, SettingsService $settings): RedirectResponse
    {
        abort_unless($settings->get('smtp_host'), 404);
        $request->validate(['email' => ['required', 'email']]);

        try {
            Password::sendResetLink(['email' => $request->input('email'), 'is_active' => true]);
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Não foi possível enviar o e-mail. Verifique as configurações de SMTP.');
        }

        // mesma resposta exista ou não a conta (não revela e-mails cadastrados)
        return back()->with('success', 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.');
    }

    public function edit(Request $request, string $token): Response
    {
        return Inertia::render('Admin/ResetPassword', ['token' => $token, 'email' => (string) $request->query('email')]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->numbers()],
        ], [], ['password' => 'senha']);

        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => $password])->setRememberToken(null);
            $user->save();
        });

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('admin.login')->with('success', 'Senha redefinida. Faça login.')
            : back()->withErrors(['email' => 'Link inválido ou expirado.']);
    }
}
