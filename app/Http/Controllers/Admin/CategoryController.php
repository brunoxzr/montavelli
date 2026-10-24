<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MeasurementTable;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => Category::withCount('products')->orderBy('position')->get()->map(fn ($c) => [
                ...$c->only('id', 'name', 'slug', 'parent_id', 'measurement_table_id', 'image_alt', 'position', 'is_active', 'products_count'),
                'image' => ImageService::url($c->image_path, 'card'),
            ]),
            'measurementTables' => MeasurementTable::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request, ImageService $images): RedirectResponse
    {
        $this->save(new Category, $request, $images);

        return back()->with('success', 'Categoria criada.');
    }

    public function update(Request $request, Category $category, ImageService $images): RedirectResponse
    {
        $this->save($category, $request, $images);

        return back()->with('success', 'Categoria salva.');
    }

    public function destroy(Category $category, ImageService $images): RedirectResponse
    {
        $images->delete($category->image_path);
        $category->delete();

        return back()->with('success', 'Categoria excluída. Os produtos ficaram sem categoria.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        foreach ($request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'] as $i => $id) {
            Category::whereKey($id)->update(['position' => $i]);
        }

        return back();
    }

    private function save(Category $category, Request $request, ImageService $images): void
    {
        $request->merge(['slug' => Str::slug($request->input('slug') ?: $request->input('name', ''))]);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:120', Rule::unique('categories', 'slug')->ignore($category->id)],
            'parent_id' => ['nullable', 'exists:categories,id', Rule::notIn([$category->id])],
            'measurement_table_id' => ['nullable', 'exists:measurement_tables,id'],
            'is_active' => ['boolean'],
            'image' => ['nullable', ...ImageService::rules()],
            'image_alt' => ['nullable', 'string', 'max:160'],
            'remove_image' => ['boolean'],
        ], [], ['name' => 'nome']);

        if ($request->hasFile('image') || ($data['remove_image'] ?? false)) {
            $images->delete($category->image_path);
            $category->image_path = $request->hasFile('image') ? $images->store($request->file('image'), 'category')['path'] : null;
        }
        unset($data['image'], $data['remove_image']);

        if (! $category->exists) {
            $data['position'] = (int) Category::max('position') + 1;
        }
        $category->fill($data)->save();
    }
}
