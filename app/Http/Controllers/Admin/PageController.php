<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\HtmlSanitizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /** Slugs que conflitam com rotas fixas. */
    private const RESERVED = ['admin', 'produtos', 'links', 'sacola', 'storage', 'build', 'brand', 'up'];

    public function index(): Response
    {
        return Inertia::render('Admin/Pages/Index', [
            'pages' => Page::orderBy('title')->get(['id', 'title', 'slug', 'is_active', 'show_in_footer', 'updated_at']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Form', ['page' => null]);
    }

    public function store(Request $request, HtmlSanitizer $sanitizer): RedirectResponse
    {
        $page = Page::create($this->validated($request, $sanitizer));

        return redirect()->route('admin.pages.edit', $page)->with('success', 'Página criada.');
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Form', ['page' => $page]);
    }

    public function update(Request $request, Page $page, HtmlSanitizer $sanitizer): RedirectResponse
    {
        $page->update($this->validated($request, $sanitizer, $page));

        return back()->with('success', 'Página salva.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return redirect()->route('admin.pages.index')->with('success', 'Página excluída.');
    }

    private function validated(Request $request, HtmlSanitizer $sanitizer, ?Page $page = null): array
    {
        $request->merge(['slug' => Str::slug($request->input('slug') ?: $request->input('title', ''))]);
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:120', Rule::notIn(self::RESERVED), Rule::unique('pages', 'slug')->ignore($page?->id)],
            'content' => ['nullable', 'string', 'max:100000'],
            'is_active' => ['boolean'],
            'show_in_footer' => ['boolean'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:320'],
        ], ['slug.not_in' => 'Este endereço é reservado pelo sistema.'], ['title' => 'título', 'slug' => 'endereço']);

        $data['content'] = $sanitizer->clean($data['content'] ?? '');

        return $data;
    }
}
