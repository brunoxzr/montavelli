<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Public\ProductPresenter;
use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\Color;
use App\Models\MeasurementTable;
use App\Models\Product;
use App\Models\Size;
use App\Models\Tag;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(Product::STATUSES)],
            'category' => ['nullable', 'integer'],
        ]);

        $products = Product::with(['images', 'category:id,name'])
            ->when($filters['q'] ?? null, fn ($q, $v) => $q->where(fn ($w) => $w->where('name', 'like', "%$v%")->orWhere('sku', 'like', "%$v%")))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['category'] ?? null, fn ($q, $v) => $q->where('category_id', $v))
            ->latest()
            ->paginate(20)->withQueryString()
            ->through(fn (Product $p) => [
                ...ProductPresenter::card($p),
                'sku' => $p->sku,
                'status' => $p->status,
                'views' => $p->views_count,
                'clicks' => $p->order_clicks_count,
            ]);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $filters,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Form', [...$this->options(), 'product' => null]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $product = DB::transaction(fn () => $this->save(new Product, $request->validated()));

        return redirect()->route('admin.products.edit', $product)->with('success', 'Produto criado. Agora adicione as fotos.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['images', 'variants', 'tags']);

        return Inertia::render('Admin/Products/Form', [
            ...$this->options(),
            'product' => [
                ...$product->only([
                    'id', 'name', 'slug', 'sku', 'description', 'category_id', 'measurement_table_id', 'price', 'sale_price',
                    'status', 'is_featured', 'track_stock', 'composition', 'care', 'measurements_note', 'notes',
                    'seo_title', 'seo_description', 'views_count', 'order_clicks_count',
                ]),
                'sale_starts_at' => $product->sale_starts_at?->format('Y-m-d\TH:i'),
                'sale_ends_at' => $product->sale_ends_at?->format('Y-m-d\TH:i'),
                'tags' => $product->tags->pluck('name'),
                'variants' => $product->variants->map->only('size_id', 'color_id', 'stock'),
                'images' => $product->images->map(fn ($i) => [
                    'id' => $i->id, 'alt' => $i->alt, 'is_cover' => $i->is_cover,
                    'thumb' => ImageService::url($i->path, 'card'), 'placeholder' => $i->placeholder,
                ]),
            ],
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        DB::transaction(fn () => $this->save($product, $request->validated()));

        return back()->with('success', 'Produto salvo.');
    }

    public function destroy(Product $product, ImageService $images): RedirectResponse
    {
        $this->deleteWithImages($product, $images);

        return redirect()->route('admin.products.index')->with('success', 'Produto excluído.');
    }

    public function duplicate(Product $product): RedirectResponse
    {
        $copy = DB::transaction(function () use ($product) {
            $product->load(['variants', 'tags', 'images']);
            $copy = $product->replicate(['views_count', 'order_clicks_count']);
            $copy->name = $product->name.' (cópia)';
            $copy->slug = $this->uniqueSlug($product->slug.'-copia');
            $copy->sku = null;
            $copy->status = 'draft';
            $copy->save();
            $copy->tags()->sync($product->tags->pluck('id'));
            $copy->variants()->createMany($product->variants->map->only('size_id', 'color_id', 'stock')->all());

            // copia os arquivos das imagens (para poder excluir um sem afetar o outro)
            $disk = Storage::disk(config('montavelli.disk'));
            foreach ($product->images as $image) {
                $dir = dirname($image->path).'/'.Str::random(20);
                foreach ($disk->files($image->path) as $file) {
                    $disk->copy($file, $dir.'/'.basename($file));
                }
                $copy->images()->create([...$image->only('alt', 'position', 'is_cover', 'placeholder'), 'path' => $dir]);
            }

            return $copy;
        });

        return redirect()->route('admin.products.edit', $copy)->with('success', 'Produto duplicado como rascunho.');
    }

    public function bulk(Request $request, ImageService $images): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
            'action' => ['required', Rule::in(['active', 'draft', 'sold_out', 'archived', 'delete', 'category'])],
            'category_id' => ['nullable', 'required_if:action,category', 'exists:categories,id'],
        ]);

        $query = Product::whereIn('id', $data['ids']);

        match ($data['action']) {
            'delete' => $query->get()->each(fn ($p) => $this->deleteWithImages($p, $images)),
            'category' => $query->update(['category_id' => $data['category_id']]),
            default => $query->update(['status' => $data['action']]),
        };

        return back()->with('success', count($data['ids']).' produto(s) atualizado(s).');
    }

    private function save(Product $product, array $data): Product
    {
        $variants = $data['variants'] ?? [];
        $tags = $data['tags'] ?? [];
        unset($data['variants'], $data['tags']);

        $product->fill($data)->save();

        $tagIds = collect($tags)->map(fn ($t) => trim($t))->filter()->unique()
            ->map(fn ($name) => Tag::firstOrCreate(['slug' => Str::slug($name)], ['name' => $name])->id);
        $product->tags()->sync($tagIds);

        $product->variants()->delete();
        $product->variants()->createMany(
            collect($variants)
                ->filter(fn ($v) => ($v['size_id'] ?? null) || ($v['color_id'] ?? null))
                ->unique(fn ($v) => ($v['size_id'] ?? '').'-'.($v['color_id'] ?? ''))
                ->map(fn ($v) => [
                    'size_id' => $v['size_id'] ?? null,
                    'color_id' => $v['color_id'] ?? null,
                    'stock' => $product->track_stock ? (int) ($v['stock'] ?? 0) : null,
                ])->values()->all()
        );

        return $product;
    }

    private function deleteWithImages(Product $product, ImageService $images): void
    {
        $product->images->each(fn ($i) => $images->delete($i->path));
        $product->delete();
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        for ($i = 2; Product::where('slug', $slug)->exists(); $i++) {
            $slug = "$base-$i";
        }

        return $slug;
    }

    private function options(): array
    {
        return [
            'categories' => Category::orderBy('name')->get(['id', 'name', 'parent_id']),
            'sizes' => Size::orderBy('position')->get(['id', 'name']),
            'colors' => Color::orderBy('position')->get(['id', 'name', 'hex']),
            'measurementTables' => MeasurementTable::orderBy('name')->get(['id', 'name']),
            'allTags' => Tag::orderBy('name')->pluck('name'),
        ];
    }
}
