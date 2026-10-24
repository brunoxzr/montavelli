<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ImageService;
use App\Services\SettingsService;
use App\Services\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    private const GROUPS = ['geral', 'whatsapp', 'aparencia', 'imagens', 'home', 'rodape', 'seo', 'email', 'moeda', 'sistema'];

    public function edit(SettingsService $settings, string $group = 'geral'): Response
    {
        abort_unless(in_array($group, self::GROUPS, true), 404);
        $all = $settings->all();
        $all['smtp_password'] = $all['smtp_password'] ? '********' : null;

        $disk = Storage::disk(config('montavelli.disk'));

        return Inertia::render('Admin/Settings', [
            'group' => $group,
            'values' => $all,
            'files' => [
                'logo_light' => $all['logo_light'] ? $disk->url($all['logo_light']) : null,
                'logo_dark' => $all['logo_dark'] ? $disk->url($all['logo_dark']) : null,
                'favicon' => $all['favicon'] ? $disk->url($all['favicon']) : null,
            ],
            'whatsappVariables' => WhatsAppService::VARIABLES,
            'defaults' => [
                'whatsapp_template_product' => WhatsAppService::DEFAULT_PRODUCT_TEMPLATE,
            ],
        ]);
    }

    public function update(Request $request, SettingsService $settings, ImageService $images, string $group): RedirectResponse
    {
        abort_unless(in_array($group, self::GROUPS, true), 404);
        $data = $request->validate($this->rules($group));

        if ($group === 'geral') {
            foreach (['logo_light', 'logo_dark', 'favicon'] as $key) {
                if ($request->hasFile($key) || $request->boolean("remove_$key")) {
                    $images->delete($settings->get($key));
                    $data[$key] = $request->hasFile($key) ? $images->storeLogo($request->file($key), $key === 'favicon' ? 256 : 800) : null;
                }
                unset($data["remove_$key"]);
            }
        }
        if ($group === 'email') {
            if (($data['smtp_password'] ?? null) === '********') {
                unset($data['smtp_password']); // não alterou
            } elseif (! empty($data['smtp_password'])) {
                $data['smtp_password'] = Crypt::encryptString($data['smtp_password']);
            }
        }
        if ($group === 'home') {
            $data['trust_badges'] = array_values($data['trust_badges'] ?? []);
        }

        $settings->set($data);

        return back()->with('success', 'Configurações salvas.');
    }

    private function rules(string $group): array
    {
        $hex = ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'];

        return match ($group) {
            'geral' => [
                'store_name' => ['required', 'string', 'max:60'],
                'tagline' => ['nullable', 'string', 'max:300'],
                'instagram' => ['nullable', 'string', 'max:60', 'regex:/^@?[A-Za-z0-9._]+$/'],
                'contact_email' => ['nullable', 'email', 'max:150'],
                'logo_light' => ['nullable', 'image', 'mimes:png,webp,jpg,jpeg', 'max:4096'],
                'logo_dark' => ['nullable', 'image', 'mimes:png,webp,jpg,jpeg', 'max:4096'],
                'favicon' => ['nullable', 'image', 'mimes:png', 'max:1024'],
                'remove_logo_light' => ['boolean'], 'remove_logo_dark' => ['boolean'], 'remove_favicon' => ['boolean'],
            ],
            'whatsapp' => [
                'whatsapp_number' => ['nullable', 'string', 'max:25', 'regex:/^[\d\s()+-]{10,25}$/'],
                'whatsapp_button_label' => ['required', 'string', 'max:40'],
                'whatsapp_template_product' => ['nullable', 'string', 'max:1000'],
                'whatsapp_template_bag' => ['nullable', 'string', 'max:1000'],
            ],
            'aparencia' => [
                'color_black' => $hex, 'color_champagne' => $hex, 'color_white' => $hex, 'color_offwhite' => $hex,
                'font_heading' => ['required', Rule::in(['cormorant', 'cinzel'])],
                'radius' => ['required', Rule::in(['none', 'sm', 'md', 'lg'])],
                'button_style' => ['required', Rule::in(['filled', 'outline'])],
            ],
            'imagens' => [
                'image_ratio' => ['required', Rule::in(['4:5', '3:4', '2:3', '1:1'])],
                'image_quality' => ['required', 'integer', 'min:50', 'max:95'],
            ],
            'home' => [
                'home_sections' => ['required', 'array'],
                'home_sections.*.key' => ['required', Rule::in(['banners', 'intro', 'badges', 'categories', 'featured', 'latest'])],
                'home_sections.*.active' => ['boolean'],
                'home_sections.*.title' => ['nullable', 'string', 'max:80'],
                'trust_badges' => ['nullable', 'array', 'max:6'],
                'trust_badges.*.icon' => ['required', 'string', 'max:30'],
                'trust_badges.*.text' => ['required', 'string', 'max:60'],
                'trust_badges.*.active' => ['boolean'],
            ],
            'rodape' => [
                'footer_text' => ['nullable', 'string', 'max:500'],
            ],
            'seo' => [
                'seo_title' => ['nullable', 'string', 'max:70'],
                'seo_description' => ['nullable', 'string', 'max:320'],
                'head_scripts' => ['nullable', 'string', 'max:5000'],
            ],
            'email' => [
                'smtp_host' => ['nullable', 'string', 'max:150'],
                'smtp_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
                'smtp_user' => ['nullable', 'string', 'max:150'],
                'smtp_password' => ['nullable', 'string', 'max:150'],
                'smtp_encryption' => ['nullable', Rule::in(['tls', 'ssl'])],
                'mail_from' => ['nullable', 'email', 'max:150'],
                'mail_from_name' => ['nullable', 'string', 'max:80'],
            ],
            'moeda' => [
                'currency_symbol' => ['required', 'string', 'max:5'],
                'decimal_separator' => ['required', Rule::in([',', '.'])],
                'thousands_separator' => ['required', Rule::in(['.', ',', ' '])],
            ],
            'sistema' => [
                'maintenance' => ['boolean'],
            ],
        };
    }
}
