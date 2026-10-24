<?php

namespace App\Providers;

use App\Services\SettingsService;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SettingsService::class);
    }

    public function boot(): void
    {
        Route::resourceVerbs(['create' => 'novo', 'edit' => 'editar']);

        ResetPassword::createUrlUsing(
            fn ($user, string $token) => route('admin.password.reset', ['token' => $token, 'email' => $user->email])
        );

        $this->configureMailFromSettings();
    }

    /** SMTP configurável no admin (sobrepõe o .env quando preenchido). */
    private function configureMailFromSettings(): void
    {
        try {
            if (! Schema::hasTable('settings')) {
                return;
            }
            $s = app(SettingsService::class)->all();
        } catch (\Throwable) {
            return;
        }

        if (! $s['smtp_host']) {
            return;
        }

        try {
            $password = $s['smtp_password'] ? Crypt::decryptString($s['smtp_password']) : null;
        } catch (\Throwable) {
            $password = null;
        }

        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => $s['smtp_host'],
            'mail.mailers.smtp.port' => (int) ($s['smtp_port'] ?: 587),
            'mail.mailers.smtp.username' => $s['smtp_user'],
            'mail.mailers.smtp.password' => $password,
            'mail.mailers.smtp.scheme' => $s['smtp_encryption'] === 'ssl' ? 'smtps' : 'smtp',
            'mail.from.address' => $s['mail_from'] ?: $s['smtp_user'],
            'mail.from.name' => $s['mail_from_name'] ?: $s['store_name'],
        ]);
    }
}
