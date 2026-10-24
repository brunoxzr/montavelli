<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Services\ImageService;
use App\Services\SettingsService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(SettingsService $settings): Response
    {
        $base = fn () => Product::visible()->with(['images', 'category:id,name']);

        $featured = $base()->where('is_featured', true)->latest()->limit(8)->get();
        $latest = $base()->whereNotIn('id', $featured->pluck('id'))->latest()->limit(8)->get();

        return Inertia::render('Public/Home', [
            'banners' => Banner::where('is_active', true)->orderBy('position')->get()->map(fn (Banner $b) => [
                'id' => $b->id,
                'title' => $b->title,
                'subtitle' => $b->subtitle,
                'link_url' => $b->link_url,
                'button_label' => $b->button_label,
                'alt' => $b->image_alt ?: $b->title,
                'srcset' => ImageService::srcset($b->image_path, 'banner'),
                'src' => ImageService::url($b->image_path, 'lg', 'jpg'),
                'mobile' => ImageService::url($b->mobile_image_path, 'sm'),
            ]),
            'categories' => Category::active()->whereNull('parent_id')->whereHas('products', fn ($q) => $q->visible())
                ->orderBy('position')->get(['id', 'name', 'slug', 'image_path', 'image_alt'])
                ->map(fn ($c) => [
                    'id' => $c->id, 'name' => $c->name, 'slug' => $c->slug, 'alt' => $c->image_alt ?: $c->name,
                    'image' => ImageService::url($c->image_path, 'card'),
                ]),
            'featured' => $featured->map(fn (Product $p) => ProductPresenter::card($p)),
            'latest' => $latest->map(fn (Product $p) => ProductPresenter::card($p)),
        ])->withViewData(['meta' => [
            'title' => $settings->get('seo_title') ?: $settings->get('store_name'),
            'description' => $settings->get('seo_description'),
        ]]);
    }
}
