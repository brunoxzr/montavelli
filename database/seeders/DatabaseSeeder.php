<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Cria somente o admin (via .env) e as configurações padrão. Sem produtos de exemplo. */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if ($email && $password) {
            User::updateOrCreate(
                ['email' => $email],
                ['name' => env('ADMIN_NAME', 'Administrador'), 'password' => $password, 'is_active' => true],
            );
        }

        $defaults = [];
        foreach (SettingsService::DEFAULTS as $items) {
            $defaults += $items;
        }
        app(SettingsService::class)->set($defaults);
    }
}
