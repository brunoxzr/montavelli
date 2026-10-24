<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Public\LinksController;
use App\Models\LinkItem;
use App\Services\ImageService;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LinkController extends Controller
{
    public const ICONS = ['instagram', 'whatsapp', 'globe', 'store', 'map-pin', 'mail', 'phone', 'tiktok', 'youtube', 'facebook', 'shopping-bag', 'star', 'link'];

    public function index(SettingsService $settings): Response
    {
        return Inertia::render('Admin/Links/Index', [
            'links' => LinkItem::orderBy('position')->get()->map(fn ($l) => [
                ...$l->only('id', 'title', 'url', 'icon', 'kind', 'is_highlighted', 'is_active', 'clicks_count'),
                'resolved' => LinksController::resolveUrl($l),
            ]),
            'icons' => self::ICONS,
            'avatar' => ImageService::url($settings->get('links_avatar'), 'sm'),
            'publicUrl' => url($settings->get('links_path') ?: 'links'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        LinkItem::create([...$this->validated($request), 'position' => (int) LinkItem::max('position') + 1]);

        return back()->with('success', 'Link criado.');
    }

    public function update(Request $request, LinkItem $link): RedirectResponse
    {
        $link->update($this->validated($request));

        return back()->with('success', 'Link salvo.');
    }

    public function destroy(LinkItem $link): RedirectResponse
    {
        $link->delete();

        return back()->with('success', 'Link excluído.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        foreach ($request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'] as $i => $id) {
            LinkItem::whereKey($id)->update(['position' => $i]);
        }

        return back();
    }

    /** Aparência da página: título, descrição, avatar, estilo e URL curta. */
    public function settings(Request $request, SettingsService $settings, ImageService $images): RedirectResponse
    {
        $data = $request->validate([
            'links_title' => ['nullable', 'string', 'max:80'],
            'links_description' => ['nullable', 'string', 'max:300'],
            'links_button_style' => ['required', Rule::in(['filled', 'outline'])],
            'links_path' => ['required', 'alpha_dash', 'max:40', Rule::notIn(['admin', 'produtos', 'sacola', 'storage', 'build', 'brand', 'up'])],
            'avatar' => ['nullable', ...ImageService::rules()],
            'remove_avatar' => ['boolean'],
        ], [], ['links_path' => 'endereço']);

        if ($request->hasFile('avatar') || ($data['remove_avatar'] ?? false)) {
            $images->delete($settings->get('links_avatar'));
            $data['links_avatar'] = $request->hasFile('avatar') ? $images->store($request->file('avatar'), 'avatar')['path'] : null;
        }
        unset($data['avatar'], $data['remove_avatar']);
        $settings->set($data);

        return back()->with('success', 'Aparência salva.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:80'],
            'kind' => ['required', Rule::in(['custom', 'whatsapp', 'instagram', 'catalog'])],
            'url' => ['nullable', 'required_if:kind,custom', 'string', 'max:500', 'regex:#^(https?://|mailto:|tel:|/)#i'],
            'icon' => ['nullable', Rule::in(self::ICONS)],
            'is_highlighted' => ['boolean'],
            'is_active' => ['boolean'],
        ], ['url.regex' => 'Use um endereço começando com https://, mailto:, tel: ou /'], ['title' => 'título', 'url' => 'endereço']);

        if ($data['kind'] !== 'custom') {
            $data['url'] = null;
        }

        return $data;
    }
}
