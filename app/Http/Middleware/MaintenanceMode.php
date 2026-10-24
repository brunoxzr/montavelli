<?php

namespace App\Http\Middleware;

use App\Services\SettingsService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/** Modo manutenção do admin: o público vê um aviso; admins logados navegam normalmente. */
class MaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        if (
            app(SettingsService::class)->get('maintenance')
            && ! $request->user()
            && ! $request->is('admin', 'admin/*', 'up', 'build/*', 'storage/*', 'brand/*')
        ) {
            return Inertia::render('Public/Maintenance')->toResponse($request)->setStatusCode(503);
        }

        return $next($request);
    }
}
