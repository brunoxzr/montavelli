<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('montavelli:create-admin {--name=} {--email=} {--password=}')]
#[Description('Cria (ou atualiza a senha de) um administrador')]
class CreateAdmin extends Command
{
    public function handle(): int
    {
        $name = $this->option('name') ?: $this->ask('Nome', 'Administrador');
        $email = $this->option('email') ?: $this->ask('E-mail');
        $password = $this->option('password') ?: $this->secret('Senha (mín. 8 caracteres)');

        if (! filter_var($email, FILTER_VALIDATE_EMAIL) || strlen((string) $password) < 8) {
            $this->error('E-mail inválido ou senha com menos de 8 caracteres.');

            return self::FAILURE;
        }

        User::updateOrCreate(['email' => $email], ['name' => $name, 'password' => $password, 'is_active' => true]);
        $this->info("Administrador {$email} pronto.");

        return self::SUCCESS;
    }
}
