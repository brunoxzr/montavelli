<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\User;
use App\Services\HtmlSanitizer;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_sanitizer_strips_scripts_and_handlers(): void
    {
        $html = app(HtmlSanitizer::class)->clean(
            '<p onclick="x()">Oi <strong>forte</strong><script>alert(1)</script></p><a href="javascript:alert(1)">a</a><img src=x onerror=alert(1)><a href="https://ok.com">ok</a>'
        );

        $this->assertStringNotContainsString('script', $html);
        $this->assertStringNotContainsString('onclick', $html);
        $this->assertStringNotContainsString('onerror', $html);
        $this->assertStringNotContainsString('javascript:', $html);
        $this->assertStringContainsString('<strong>forte</strong>', $html);
        $this->assertStringContainsString('href="https://ok.com"', $html);
    }

    public function test_pages_are_sanitized_on_save_and_reserved_slugs_blocked(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post('/admin/paginas', ['title' => 'Sobre', 'content' => '<p>Texto</p><script>x</script>', 'is_active' => true])->assertRedirect();
        $this->assertSame('<p>Texto</p>', Page::firstOrFail()->content);

        $this->post('/admin/paginas', ['title' => 'Admin', 'slug' => 'admin'])->assertSessionHasErrors('slug');
    }

    public function test_settings_are_saved_and_smtp_password_is_encrypted(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post('/admin/configuracoes/email', ['smtp_host' => 'smtp.x.com', 'smtp_password' => 'segredo'])->assertSessionHasNoErrors();
        $stored = app(SettingsService::class)->get('smtp_password');
        $this->assertNotSame('segredo', $stored);

        // não vaza para o frontend
        $this->get('/')->assertDontSee('smtp.x.com');
    }

    public function test_maintenance_mode_hides_store_but_not_admin(): void
    {
        app(SettingsService::class)->set(['maintenance' => true]);

        $this->get('/')->assertStatus(503);
        $this->get('/admin/login')->assertOk();
        $this->actingAs(User::factory()->create())->get('/')->assertOk();
    }
}
