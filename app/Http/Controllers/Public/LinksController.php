<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\LinkItem;
use App\Services\ImageService;
use App\Services\SettingsService;
use App\Services\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LinksController extends Controller
{
    public function index(SettingsService $settings): Response
    {
        return Inertia::render('Public/Links', [
            'links' => LinkItem::where('is_active', true)->orderBy('position')->get(['id', 'title', 'icon', 'kind', 'is_highlighted'])
                ->filter(fn ($l) => self::resolveUrl($l) !== null)->values(),
            'avatar' => ImageService::url($settings->get('links_avatar'), 'sm'),
        ])->withViewData(['meta' => [
            'title' => $settings->get('links_title') ?: $settings->get('store_name'),
            'description' => $settings->get('links_description') ?: $settings->get('tagline'),
        ]]);
    }

    /** Conta o clique e redireciona. */
    public function go(LinkItem $link): RedirectResponse
    {
        $url = self::resolveUrl($link);
        abort_unless($link->is_active && $url, 404);
        LinkItem::whereKey($link->id)->increment('clicks_count');

        return redirect()->away($url);
    }

    /** Links especiais usam os dados das configurações (sempre atualizados). */
    public static function resolveUrl(LinkItem $link): ?string
    {
        return match ($link->kind) {
            'whatsapp' => ($n = app(WhatsAppService::class)->number()) ? "https://wa.me/$n" : null,
            'instagram' => ($h = ltrim((string) app(SettingsService::class)->get('instagram'), '@')) ? "https://instagram.com/$h" : null,
            'catalog' => route('catalog'),
            default => $link->url ?: null,
        };
    }
}
