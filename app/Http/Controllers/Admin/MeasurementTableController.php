<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MeasurementTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MeasurementTableController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Measurements/Index', [
            'tables' => MeasurementTable::orderBy('name')->get(['id', 'name', 'content']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        MeasurementTable::create($this->validated($request));

        return back()->with('success', 'Tabela criada.');
    }

    public function update(Request $request, MeasurementTable $measurement): RedirectResponse
    {
        $measurement->update($this->validated($request));

        return back()->with('success', 'Tabela salva.');
    }

    public function destroy(MeasurementTable $measurement): RedirectResponse
    {
        $measurement->delete();

        return back()->with('success', 'Tabela excluída.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'content' => ['required', 'array'],
            'content.columns' => ['required', 'array', 'min:1', 'max:12'],
            'content.columns.*' => ['required', 'string', 'max:30'],
            'content.rows' => ['required', 'array', 'min:1', 'max:30'],
            'content.rows.*.label' => ['required', 'string', 'max:20'],
            'content.rows.*.values' => ['array'],
            'content.rows.*.values.*' => ['nullable', 'string', 'max:20'],
        ], [], ['name' => 'nome', 'content.columns.*' => 'coluna', 'content.rows.*.label' => 'linha']);
    }
}
