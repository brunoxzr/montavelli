<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Services\SettingsService;
use App\Services\WhatsAppService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsAppLinkTest extends TestCase
{
    use RefreshDatabase;

    public function test_without_number_there_is_no_link(): void
    {
        $this->assertNull(app(WhatsAppService::class)->productLink(['produto' => 'X']));
    }

    public function test_template_variables_are_replaced_and_encoded(): void
    {
        app(SettingsService::class)->set([
            'whatsapp_number' => '+55 (11) 91234-5678',
            'whatsapp_template_product' => 'Quero {produto} tam {tamanho} cor {cor} {preco} {sku} {link}',
        ]);

        $url = app(WhatsAppService::class)->productLink([
            'produto' => 'Camisa', 'tamanho' => 'M', 'cor' => 'Preta', 'preco' => '10', 'sku' => 'A1', 'link' => 'https://x.test/p',
        ]);

        $this->assertStringStartsWith('https://wa.me/5511912345678?text=', $url);
        $this->assertSame(
            'Quero Camisa tam M cor Preta 10 A1 https://x.test/p',
            urldecode(substr($url, strlen('https://wa.me/5511912345678?text='))),
        );
    }

    public function test_bag_lists_all_items(): void
    {
        app(SettingsService::class)->set(['whatsapp_number' => '5511999999999']);

        $url = app(WhatsAppService::class)->bagLink([
            ['produto' => 'A', 'tamanho' => 'P', 'cor' => 'Azul', 'quantidade' => 2],
            ['produto' => 'B', 'tamanho' => 'M', 'cor' => 'Preto'],
        ]);

        $text = urldecode(explode('text=', $url)[1]);
        $this->assertStringContainsString('2x A', $text);
        $this->assertStringContainsString('1x B', $text);
    }

    public function test_product_endpoint_returns_link_and_counts_click(): void
    {
        app(SettingsService::class)->set(['whatsapp_number' => '5511999999999']);
        $product = Product::create(['name' => 'Camisa', 'slug' => 'camisa', 'status' => 'active', 'price' => 10]);

        $this->postJson("/produtos/{$product->slug}/whatsapp", ['tamanho' => 'M'])
            ->assertOk()->assertJsonStructure(['url']);

        $this->assertSame(1, $product->fresh()->order_clicks_count);
    }

    public function test_endpoint_404_without_number(): void
    {
        $product = Product::create(['name' => 'Camisa', 'slug' => 'camisa', 'status' => 'active']);

        $this->postJson("/produtos/{$product->slug}/whatsapp")->assertNotFound();
    }
}
