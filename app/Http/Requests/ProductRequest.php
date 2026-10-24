<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->input('slug') ?: $this->input('name', '')),
            'sku' => $this->input('sku') ?: null,
        ]);
    }

    public function rules(): array
    {
        $id = $this->route('product')?->id;

        return [
            'name' => ['required', 'string', 'max:160'],
            'slug' => ['required', 'string', 'max:180', Rule::unique('products', 'slug')->ignore($id)],
            'sku' => ['nullable', 'string', 'max:60', Rule::unique('products', 'sku')->ignore($id)],
            'description' => ['nullable', 'string', 'max:5000'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'measurement_table_id' => ['nullable', 'exists:measurement_tables,id'],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', 'max:40'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'sale_starts_at' => ['nullable', 'date'],
            'sale_ends_at' => ['nullable', 'date', 'after_or_equal:sale_starts_at'],
            'status' => ['required', Rule::in(Product::STATUSES)],
            'is_featured' => ['boolean'],
            'track_stock' => ['boolean'],
            'composition' => ['nullable', 'string', 'max:2000'],
            'care' => ['nullable', 'string', 'max:2000'],
            'measurements_note' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'variants' => ['nullable', 'array', 'max:200'],
            'variants.*.size_id' => ['nullable', 'exists:sizes,id'],
            'variants.*.color_id' => ['nullable', 'exists:colors,id'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome', 'price' => 'preço', 'sale_price' => 'preço promocional',
            'sale_ends_at' => 'fim da promoção', 'sale_starts_at' => 'início da promoção',
        ];
    }

    public function messages(): array
    {
        return ['sale_price.lt' => 'O preço promocional deve ser menor que o preço.'];
    }
}
