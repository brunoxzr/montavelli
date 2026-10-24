<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Color;
use App\Models\Size;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Tamanhos e cores reutilizáveis. {type} = tamanhos | cores */
class AttributeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Attributes/Index', [
            'sizes' => Size::orderBy('position')->get(['id', 'name']),
            'colors' => Color::orderBy('position')->get(['id', 'name', 'hex']),
        ]);
    }

    public function store(Request $request, string $type): RedirectResponse
    {
        $model = $this->model($type);
        $data = $request->validate($this->rules($type));
        $model::create([...$data, 'position' => (int) $model::max('position') + 1]);

        return back()->with('success', 'Adicionado.');
    }

    public function update(Request $request, string $type, int $id): RedirectResponse
    {
        $item = $this->model($type)::findOrFail($id);
        $item->update($request->validate($this->rules($type, $id)));

        return back()->with('success', 'Salvo.');
    }

    public function destroy(string $type, int $id): RedirectResponse
    {
        $this->model($type)::findOrFail($id)->delete();

        return back()->with('success', 'Excluído.');
    }

    public function reorder(Request $request, string $type): RedirectResponse
    {
        $model = $this->model($type);
        foreach ($request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'] as $i => $id) {
            $model::whereKey($id)->update(['position' => $i]);
        }

        return back();
    }

    private function model(string $type): string
    {
        return match ($type) {
            'tamanhos' => Size::class,
            'cores' => Color::class,
            default => abort(404),
        };
    }

    private function rules(string $type, ?int $id = null): array
    {
        $table = $type === 'tamanhos' ? 'sizes' : 'colors';
        $rules = ['name' => ['required', 'string', 'max:40', Rule::unique($table, 'name')->ignore($id)]];
        if ($type === 'cores') {
            $rules['hex'] = ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'];
        }

        return $rules;
    }
}
