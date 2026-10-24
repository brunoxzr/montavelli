<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProductImageController extends Controller
{
    public function store(Request $request, Product $product, ImageService $images): RedirectResponse
    {
        $data = $request->validate([
            'image' => ['required', ...ImageService::rules()],
            'alt' => ['nullable', 'string', 'max:160'],
            'crop' => ['nullable', 'array'],
            'crop.x' => ['nullable', 'numeric', 'min:0'],
            'crop.y' => ['nullable', 'numeric', 'min:0'],
            'crop.width' => ['nullable', 'numeric', 'min:1'],
            'crop.height' => ['nullable', 'numeric', 'min:1'],
        ], [], ['image' => 'imagem']);

        $stored = $images->store($request->file('image'), 'product', $data['crop'] ?? null);

        $product->images()->create([
            ...$stored,
            'alt' => $data['alt'] ?? null,
            'position' => (int) $product->images()->max('position') + 1,
            'is_cover' => ! $product->images()->exists(),
        ]);

        return back()->with('success', 'Imagem adicionada.');
    }

    public function update(Request $request, ProductImage $image): RedirectResponse
    {
        $image->update($request->validate(['alt' => ['nullable', 'string', 'max:160']]));

        return back()->with('success', 'Texto alternativo salvo.');
    }

    public function cover(ProductImage $image): RedirectResponse
    {
        $image->product->images()->update(['is_cover' => false]);
        $image->update(['is_cover' => true]);

        return back()->with('success', 'Capa definida.');
    }

    public function reorder(Request $request, Product $product): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'];
        foreach ($ids as $position => $id) {
            $product->images()->whereKey($id)->update(['position' => $position]);
        }

        return back();
    }

    public function destroy(ProductImage $image, ImageService $images): RedirectResponse
    {
        $product = $image->product;
        $images->delete($image->path);
        $image->delete();

        if ($image->is_cover && ($first = $product->images()->first())) {
            $first->update(['is_cover' => true]);
        }

        return back()->with('success', 'Imagem removida.');
    }
}
