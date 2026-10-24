<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::orderBy('name')->get(['id', 'name', 'email', 'is_active', 'created_at']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'is_active' => ['boolean'],
        ], [], ['name' => 'nome', 'password' => 'senha']);
        User::create($data);

        return back()->with('success', 'Administrador criado.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'confirmed', Password::min(8)->letters()->numbers()],
            'is_active' => ['boolean'],
        ], [], ['name' => 'nome', 'password' => 'senha']);

        if ($user->is($request->user())) {
            $data['is_active'] = true; // ninguém se desativa sozinho
        }
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $user->update($data);

        return back()->with('success', 'Administrador salvo.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return back()->with('error', 'Você não pode excluir a própria conta.');
        }
        $user->delete();

        return back()->with('success', 'Administrador excluído.');
    }
}
