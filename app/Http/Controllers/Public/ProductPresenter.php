<?php

namespace App\Http\Controllers\Public;

use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageService;

/** Formata produtos para o frontend. (Resource simples; sem dados inventados.) */
class ProductPresenter
{
    public static function card(Product $p): array
    {
        $cover = $p->images->sortByDesc('is_cover')->first();

        return [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'price' => $p->price,
            'sale_price' => $p->activeSalePrice(),
            'sold_out' => $p->status === 'sold_out',
            'is_featured' => $p->is_featured,
            'category' => $p->category?->name,
            'image' => $cover ? self::image($cover, $p->name) : null,
        ];
    }

    public static function image(ProductImage $i, string $fallbackAlt): array
    {
        return [
            'id' => $i->id,
            'alt' => $i->alt ?: $fallbackAlt,
            'placeholder' => $i->placeholder,
            'src' => ImageService::url($i->path, 'card', 'jpg'),
            'srcset' => ImageService::srcset($i->path, 'product'),
            'srcsetJpg' => ImageService::srcset($i->path, 'product', 'jpg'),
            'thumb' => ImageService::url($i->path, 'thumb'),
            'large' => ImageService::url($i->path, 'gallery', 'jpg'),
            'zoom' => ImageService::url($i->path, 'zoom'),
        ];
    }
}
