<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

/**
 * Configurações do site (chave/valor), em cache. Tudo que não foi
 * informado pelo admin fica vazio (null) — nada é inventado.
 */
class SettingsService
{
    private const CACHE_KEY = 'montavelli.settings';

    /** Campos guardados como JSON. */
    public const JSON_KEYS = ['home_sections', 'trust_badges'];

    /** Chaves sensíveis que nunca vão para o frontend público. */
    public const PRIVATE_KEYS = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_encryption', 'mail_from', 'mail_from_name'];

    /** Chaves aceitas, por grupo, com valor padrão. */
    public const DEFAULTS = [
        'general' => [
            'store_name' => 'MONTAVELLI',
            'tagline' => "O estilo fala antes de você.\nSua próxima peça começa aqui.\nEnviamos para todo o Brasil",
            'instagram' => 'montavelli.co',
            'contact_email' => null,
            'logo_light' => null,
            'logo_dark' => null,
            'favicon' => null,
        ],
        'whatsapp' => [
            'whatsapp_number' => null,
            'whatsapp_button_label' => 'Pedir pelo WhatsApp',
            'whatsapp_template_product' => null,
            'whatsapp_template_bag' => null,
        ],
        'appearance' => [
            'color_black' => '#0B0B0B',
            'color_champagne' => '#CCC2B4',
            'color_white' => '#FFFFFF',
            'color_offwhite' => '#F8F6F2',
            'font_heading' => 'cormorant',
            'radius' => 'none',
            'button_style' => 'filled',
        ],
        'images' => [
            'image_ratio' => '4:5',
            'image_quality' => 82,
        ],
        'home' => [
            'home_sections' => [
                ['key' => 'banners', 'active' => true, 'title' => null],
                ['key' => 'intro', 'active' => true, 'title' => null],
                ['key' => 'badges', 'active' => true, 'title' => null],
                ['key' => 'categories', 'active' => true, 'title' => null],
                ['key' => 'featured', 'active' => true, 'title' => null],
                ['key' => 'latest', 'active' => true, 'title' => null],
            ],
            // Derivado da bio da marca; editável e desativável.
            'trust_badges' => [
                ['icon' => 'truck', 'text' => 'Enviamos para todo o Brasil', 'active' => true],
            ],
        ],
        'footer' => [
            'footer_text' => null,
        ],
        'seo' => [
            'seo_title' => null,
            'seo_description' => null,
            'head_scripts' => null,
        ],
        'mail' => [
            'smtp_host' => null,
            'smtp_port' => null,
            'smtp_user' => null,
            'smtp_password' => null,
            'smtp_encryption' => null,
            'mail_from' => null,
            'mail_from_name' => null,
        ],
        'currency' => [
            'currency_symbol' => 'R$',
            'decimal_separator' => ',',
            'thousands_separator' => '.',
        ],
        'links' => [
            'links_path' => 'links',
            'links_title' => null,
            'links_description' => null,
            'links_avatar' => null,
            'links_button_style' => 'filled',
        ],
        'system' => [
            'maintenance' => false,
        ],
    ];

    public function all(): array
    {
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => Setting::pluck('value', 'key')->all());

        $out = [];
        foreach (self::DEFAULTS as $items) {
            foreach ($items as $key => $default) {
                $value = $stored[$key] ?? null;
                if (in_array($key, self::JSON_KEYS, true) && is_string($value)) {
                    $value = json_decode($value, true);
                }
                $out[$key] = ($value === null || $value === '') ? $default : $value;
            }
        }
        $out['maintenance'] = filter_var($out['maintenance'], FILTER_VALIDATE_BOOLEAN);

        return $out;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    public function set(array $values): void
    {
        foreach (self::DEFAULTS as $group => $items) {
            foreach ($items as $key => $_) {
                if (! array_key_exists($key, $values)) {
                    continue;
                }
                $value = $values[$key];
                if (is_array($value)) {
                    $value = json_encode($value, JSON_UNESCAPED_UNICODE);
                } elseif (is_bool($value)) {
                    $value = $value ? '1' : '0';
                }
                Setting::updateOrCreate(['key' => $key], ['group' => $group, 'value' => $value]);
            }
        }
        Cache::forget(self::CACHE_KEY);
    }

    /** Subconjunto seguro para o frontend público. */
    public function public(): array
    {
        return collect($this->all())->except([...self::PRIVATE_KEYS, 'head_scripts'])->all();
    }

    /** Proporção configurada, ex.: "4:5" => [4, 5]. */
    public function ratio(): array
    {
        [$w, $h] = array_map('intval', explode(':', (string) $this->get('image_ratio', '4:5')) + [1 => 5]);

        return [$w ?: 4, $h ?: 5];
    }
}
