<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\LinkItem;
use App\Models\Product;
use App\Services\SettingsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(SettingsService $settings): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => Product::count(),
                'active' => Product::where('status', 'active')->count(),
                'soldOut' => Product::where('status', 'sold_out')->count(),
                'drafts' => Product::where('status', 'draft')->count(),
                'orderClicks' => (int) Product::sum('order_clicks_count'),
                'linkClicks' => (int) LinkItem::sum('clicks_count'),
            ],
            'topLinks' => LinkItem::where('clicks_count', '>', 0)->orderByDesc('clicks_count')->limit(5)->get(['id', 'title', 'clicks_count']),
            'topProducts' => Product::where('views_count', '>', 0)->orderByDesc('views_count')->limit(5)->get(['id', 'name', 'views_count', 'order_clicks_count']),
            // o que ainda falta configurar (nada é preenchido automaticamente)
            'checklist' => [
                ['label' => 'Cadastrar o número do WhatsApp', 'done' => (bool) $settings->get('whatsapp_number'), 'href' => '/admin/configuracoes/whatsapp'],
                ['label' => 'Cadastrar tamanhos e cores', 'done' => \App\Models\Size::exists() || \App\Models\Color::exists(), 'href' => '/admin/atributos'],
                ['label' => 'Criar a primeira categoria', 'done' => Category::exists(), 'href' => '/admin/categorias'],
                ['label' => 'Cadastrar o primeiro produto', 'done' => Product::exists(), 'href' => '/admin/produtos/novo'],
                ['label' => 'Montar a página de links', 'done' => LinkItem::exists(), 'href' => '/admin/links'],
            ],
        ]);
    }
}
