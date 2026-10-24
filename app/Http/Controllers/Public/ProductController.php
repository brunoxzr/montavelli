<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(Product $product, WhatsAppService $whatsapp): Response
    {
        abort_unless(in_array($product->status, ['active', 'sold_out']), 404);

        Product::whereKey($product->id)->increment('views_count');
        $product->load(['images', 'variants.size', 'variants.color', 'category.measurementTable', 'measurementTable']);

        $related = $product->category_id
            ? Product::visible()->where('category_id', $product->category_id)->whereKeyNot($product->id)
                ->with(['images', 'category:id,name'])->latest()->limit(4)->get()
                ->map(fn (Product $p) => ProductPresenter::card($p))
            : [];

        $table = $product->measurementTable ?? $product->category?->measurementTable;
        $variants = $product->variants
            ->sortBy(fn ($v) => [$v->size?->position, $v->color?->position])
            ->values();
        $images = $product->images->map(fn ($i) => ProductPresenter::image($i, $product->name));

        return Inertia::render('Public/Product', [
            'product' => [
                ...ProductPresenter::card($product),
                'sku' => $product->sku,
                'description' => $product->description,
                'composition' => $product->composition,
                'care' => $product->care,
                'measurements_note' => $product->measurements_note,
                'notes' => $product->notes,
                'category_slug' => $product->category?->slug,
                'measurement_table' => $table?->only('name', 'content'),
                'images' => $images,
                'variants' => $variants->map(fn ($v) => [
                    'id' => $v->id,
                    'size' => $v->size?->name,
                    'color' => $v->color?->name,
                    'hex' => $v->color?->hex,
                    'available' => $v->isAvailable(),
                ]),
            ],
            'related' => $related,
            'whatsappEnabled' => (bool) $whatsapp->number(),
        ])->withViewData(['meta' => [
            'title' => $product->seo_title ?: $product->name,
            'description' => $product->seo_description ?: str($product->description)->squish()->limit(160)->value(),
            'image' => $images->first()['large'] ?? null,
            'type' => 'product',
        ]]);
    }

    /** Gera o link do WhatsApp para um produto (tamanho/cor escolhidos). */
    public function whatsapp(Request $request, Product $product, WhatsAppService $whatsapp): JsonResponse
    {
        abort_unless($product->status === 'active', 404);
        $data = $request->validate([
            'tamanho' => ['nullable', 'string', 'max:50'],
            'cor' => ['nullable', 'string', 'max:50'],
        ]);

        $url = $whatsapp->productLink($whatsapp->varsFor($product, $data['tamanho'] ?? '', $data['cor'] ?? ''));

        abort_if($url === null, 404);
        Product::whereKey($product->id)->increment('order_clicks_count');

        return response()->json(['url' => $url]);
    }

    /** Sacola: monta um único pedido com vários itens (preços vêm do banco, não do navegador). */
    public function bag(Request $request, WhatsAppService $whatsapp): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.id' => ['required', 'integer'],
            'items.*.size' => ['nullable', 'string', 'max:50'],
            'items.*.color' => ['nullable', 'string', 'max:50'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $products = Product::where('status', 'active')->whereIn('id', collect($data['items'])->pluck('id'))->get()->keyBy('id');

        $items = collect($data['items'])
            ->filter(fn ($i) => $products->has($i['id']))
            ->map(fn ($i) => $whatsapp->varsFor($products[$i['id']], $i['size'] ?? '', $i['color'] ?? '') + ['quantidade' => $i['qty']])
            ->values()->all();

        abort_if($items === [], 422, 'Nenhum item disponível.');
        $url = $whatsapp->bagLink($items);
        abort_if($url === null, 404);

        Product::whereIn('id', collect($items)->pluck('id'))->increment('order_clicks_count');

        return response()->json(['url' => $url]);
    }
}
