<?php

namespace App\Services;

use App\Models\Product;

/**
 * Monta links https://wa.me/{numero}?text={mensagem} a partir dos
 * templates editáveis no admin. Sem número cadastrado, retorna null.
 */
class WhatsAppService
{
    public const VARIABLES = ['produto', 'tamanho', 'cor', 'preco', 'link', 'sku'];

    public const DEFAULT_PRODUCT_TEMPLATE = "{produto}\nTamanho: {tamanho}\nCor: {cor}\nPreço: {preco}\n{link}";

    public const DEFAULT_BAG_LINE = '{quantidade}x {produto} | Tamanho: {tamanho} | Cor: {cor} | {preco}';

    public function __construct(private SettingsService $settings) {}

    public function number(): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $this->settings->get('whatsapp_number'));

        return $digits !== '' ? $digits : null;
    }

    /** Variáveis do template para um produto. */
    public function varsFor(Product $product, string $size = '', string $color = ''): array
    {
        $price = $product->activeSalePrice() ?? $product->price;

        return [
            'id' => $product->id,
            'produto' => $product->name,
            'tamanho' => $size,
            'cor' => $color,
            'preco' => $price !== null ? $this->formatPrice($price) : '',
            'link' => route('products.show', $product),
            'sku' => $product->sku ?? '',
        ];
    }

    public function formatPrice(string|float $value): string
    {
        $s = $this->settings;

        return trim($s->get('currency_symbol', 'R$').' '.number_format((float) $value, 2, $s->get('decimal_separator', ','), $s->get('thousands_separator', '.')));
    }

    public function productLink(array $vars): ?string
    {
        $template = $this->settings->get('whatsapp_template_product') ?: self::DEFAULT_PRODUCT_TEMPLATE;

        return $this->link($this->render($template, $vars));
    }

    /** O template da sacola usa {itens} para a lista. Sem template, envia só a lista. */
    public function bagLink(array $items): ?string
    {
        $lines = array_map(fn ($item) => $this->render(self::DEFAULT_BAG_LINE, $item + ['quantidade' => 1]), $items);
        $list = implode("\n", $lines);
        $template = $this->settings->get('whatsapp_template_bag');

        return $this->link($template ? str_replace('{itens}', $list, $template) : $list);
    }

    public function render(string $template, array $vars): string
    {
        $replace = [];
        foreach ([...self::VARIABLES, 'quantidade'] as $key) {
            $replace['{'.$key.'}'] = (string) ($vars[$key] ?? '');
        }
        $text = strtr($template, $replace);
        // remove linhas/segmentos que ficaram vazios ("Tamanho: " sem valor)
        $text = preg_replace('/^[^\n:|]+:\s*$/m', '', $text);
        $text = preg_replace('/\s*\|\s*[^|:\n]+:\s*(?=\||$)/m', '', $text);
        $text = preg_replace('/\s*\|\s*$/m', '', $text);

        return trim(preg_replace("/\n{2,}/", "\n", $text));
    }

    private function link(string $message): ?string
    {
        $number = $this->number();

        return $number ? 'https://wa.me/'.$number.'?text='.rawurlencode($message) : null;
    }
}
