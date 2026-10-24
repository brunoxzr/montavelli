<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    public const STATUSES = ['draft', 'active', 'sold_out', 'archived'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'sale_starts_at' => 'datetime',
            'sale_ends_at' => 'datetime',
            'is_featured' => 'boolean',
            'track_stock' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function measurementTable(): BelongsTo
    {
        return $this->belongsTo(MeasurementTable::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function scopeVisible($q)
    {
        return $q->whereIn('status', ['active', 'sold_out']);
    }

    /** Preço promocional só vale dentro do período (quando definido). */
    public function activeSalePrice(): ?string
    {
        if ($this->sale_price === null) {
            return null;
        }
        $now = now();
        if ($this->sale_starts_at && $now->lt($this->sale_starts_at)) {
            return null;
        }
        if ($this->sale_ends_at && $now->gt($this->sale_ends_at)) {
            return null;
        }

        return $this->sale_price;
    }
}
