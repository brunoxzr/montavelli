<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'categoria' => ['nullable', 'string', 'max:150'],
            'tamanho' => ['nullable', 'integer'],
            'cor' => ['nullable', 'integer'],
            'min' => ['nullable', 'numeric', 'min:0'],
            'max' => ['nullable', 'numeric', 'min:0'],
            'ordem' => ['nullable', 'in:recentes,menor-preco,maior-preco'],
        ]);

        $query = Product::visible()->with(['images', 'category:id,name']);

        $query->when($filters['q'] ?? null, fn ($q, $v) => $q->where('name', 'like', '%'.addcslashes($v, '%_').'%'));
        $query->when($filters['categoria'] ?? null, function ($q, $slug) {
            $category = Category::where('slug', $slug)->first();
            $ids = $category ? [$category->id, ...$category->children()->pluck('id')] : [0];
            $q->whereIn('category_id', $ids);
        });
        $query->when($filters['tamanho'] ?? null, fn ($q, $v) => $q->whereHas('variants', fn ($c) => $c->where('size_id', $v)));
        $query->when($filters['cor'] ?? null, fn ($q, $v) => $q->whereHas('variants', fn ($c) => $c->where('color_id', $v)));
        $query->when($filters['min'] ?? null, fn ($q, $v) => $q->where('price', '>=', $v));
        $query->when($filters['max'] ?? null, fn ($q, $v) => $q->where('price', '<=', $v));

        match ($filters['ordem'] ?? 'recentes') {
            'menor-preco' => $query->orderByRaw('price is null')->orderBy('price'),
            'maior-preco' => $query->orderByDesc('price'),
            default => $query->latest(),
        };

        $visibleIds = Product::visible()->select('id');

        return Inertia::render('Public/Catalog', [
            'products' => $query->paginate(12)->withQueryString()->through(fn (Product $p) => ProductPresenter::card($p)),
            'filters' => $filters,
            // Somente filtros que têm dados
            'categories' => Category::active()->whereHas('products', fn ($q) => $q->visible())->orderBy('position')->get(['id', 'name', 'slug']),
            'sizes' => Size::whereIn('id', ProductVariant::whereIn('product_id', $visibleIds)->whereNotNull('size_id')->select('size_id'))
                ->orderBy('position')->get(['id', 'name']),
            'colors' => Color::whereIn('id', ProductVariant::whereIn('product_id', $visibleIds)->whereNotNull('color_id')->select('color_id'))
                ->orderBy('position')->get(['id', 'name', 'hex']),
            'priceRange' => [
                'min' => Product::visible()->min('price'),
                'max' => Product::visible()->max('price'),
            ],
        ])->withViewData(['meta' => ['title' => 'Produtos']]);
    }
}
