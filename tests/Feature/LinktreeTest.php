<?php

namespace Tests\Feature;

use App\Models\LinkItem;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LinktreeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_creates_reorders_and_toggles_links(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post('/admin/links', ['title' => 'Site', 'kind' => 'custom', 'url' => 'https://exemplo.com', 'icon' => 'globe', 'is_active' => true])
            ->assertSessionHasNoErrors();
        $this->post('/admin/links', ['title' => 'Catálogo', 'kind' => 'catalog', 'is_active' => true])->assertSessionHasNoErrors();

        [$a, $b] = LinkItem::orderBy('position')->get();
        $this->post('/admin/links/ordem', ['ids' => [$b->id, $a->id]]);
        $this->assertSame(['Catálogo', 'Site'], LinkItem::orderBy('position')->pluck('title')->all());

        $this->put("/admin/links/{$a->id}", ['title' => 'Site', 'kind' => 'custom', 'url' => 'https://exemplo.com', 'is_active' => false]);
        $this->assertFalse($a->fresh()->is_active);
    }

    public function test_rejects_javascript_urls(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/admin/links', ['title' => 'X', 'kind' => 'custom', 'url' => 'javascript:alert(1)'])
            ->assertSessionHasErrors('url');
    }

    public function test_click_is_counted_and_redirects(): void
    {
        $link = LinkItem::create(['title' => 'Site', 'url' => 'https://exemplo.com', 'kind' => 'custom']);

        $this->get("/links/ir/{$link->id}")->assertRedirect('https://exemplo.com');
        $this->assertSame(1, $link->fresh()->clicks_count);
    }

    public function test_special_links_use_settings_and_hide_when_missing(): void
    {
        $wa = LinkItem::create(['title' => 'WhatsApp', 'kind' => 'whatsapp']);

        $this->get("/links/ir/{$wa->id}")->assertNotFound();

        app(SettingsService::class)->set(['whatsapp_number' => '+55 11 99999-0000']);
        $this->get("/links/ir/{$wa->id}")->assertRedirect('https://wa.me/5511999990000');
    }

    public function test_page_is_public_and_short_path_works(): void
    {
        LinkItem::create(['title' => 'Site', 'url' => 'https://exemplo.com', 'kind' => 'custom']);
        $this->get('/links')->assertOk()->assertSee('Site');

        app(SettingsService::class)->set(['links_path' => 'bio']);
        $this->get('/bio')->assertOk()->assertSee('Site');
    }
}
