<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Page;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $isAdmin = $request->is('admin', 'admin/*');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()?->only('id', 'name', 'email'),
            ],
            'site' => fn () => self::site(),
            'nav' => fn () => $isAdmin ? null : [
                'categories' => Category::active()->whereNull('parent_id')->whereHas('products', fn ($q) => $q->visible())
                    ->orderBy('position')->get(['id', 'name', 'slug']),
                'pages' => Page::where('is_active', true)->where('show_in_footer', true)->orderBy('title')->get(['title', 'slug']),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    /** Configurações públicas + URLs das logos (com fallback para a logo oficial da marca). */
    public static function site(): array
    {
        $s = app(SettingsService::class)->public();
        $disk = Storage::disk(config('montavelli.disk'));

        return [
            ...$s,
            'logo' => [
                'ink' => $s['logo_light'] ? $disk->url($s['logo_light']) : '/brand/logo-ink.png',
                'champagne' => $s['logo_dark'] ? $disk->url($s['logo_dark']) : '/brand/logo-champagne.png',
                'wordmark' => $s['logo_light'] ? null : '/brand/wordmark-ink.png',
                'wordmarkLight' => $s['logo_dark'] ? null : '/brand/wordmark-champagne.png',
                'monogram' => '/brand/monogram-ink.png',
                'monogramLight' => '/brand/monogram-champagne.png',
            ],
        ];
    }
}
