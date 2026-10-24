<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\HtmlSanitizer;
use App\Services\SettingsService;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $slug, SettingsService $settings, HtmlSanitizer $sanitizer): Response
    {
        // URL curta configurável do Linktree (ex.: /bio)
        if ($slug === trim((string) $settings->get('links_path'), '/')) {
            return app(LinksController::class)->index($settings);
        }

        $page = Page::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return Inertia::render('Public/Page', [
            // conteúdo já é sanitizado ao salvar; sanitizamos de novo por defesa
            'page' => [...$page->only('title'), 'content' => $sanitizer->clean($page->content)],
        ])->withViewData(['meta' => [
            'title' => $page->seo_title ?: $page->title,
            'description' => $page->seo_description,
        ]]);
    }
}
