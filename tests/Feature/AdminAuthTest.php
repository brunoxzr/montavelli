<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_admin_can_login_and_see_dashboard(): void
    {
        $user = User::factory()->create(['password' => 'senha-segura-1']);

        $this->post('/admin/login', ['email' => $user->email, 'password' => 'senha-segura-1'])
            ->assertRedirect('/admin');
        $this->get('/admin')->assertOk();
    }

    public function test_wrong_password_is_rejected_and_rate_limited(): void
    {
        $user = User::factory()->create(['password' => 'senha-segura-1']);

        for ($i = 0; $i < 5; $i++) {
            $this->post('/admin/login', ['email' => $user->email, 'password' => 'errada'])
                ->assertSessionHasErrors('email');
        }

        // 6ª tentativa, mesmo com a senha certa, é bloqueada
        $this->post('/admin/login', ['email' => $user->email, 'password' => 'senha-segura-1'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_inactive_admin_cannot_login(): void
    {
        $user = User::factory()->create(['password' => 'senha-segura-1', 'is_active' => false]);

        $this->post('/admin/login', ['email' => $user->email, 'password' => 'senha-segura-1'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
