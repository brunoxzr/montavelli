<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Public\CatalogController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\LinksController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ---- Área pública ----
Route::get('/', HomeController::class)->name('home');
Route::get('/produtos', [CatalogController::class, 'index'])->name('catalog');
Route::get('/produtos/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::post('/produtos/{product:slug}/whatsapp', [ProductController::class, 'whatsapp'])
    ->middleware('throttle:30,1')->name('products.whatsapp');
Route::get('/sacola', fn () => Inertia::render('Public/Bag')->withViewData(['meta' => ['title' => 'Sacola']]))->name('bag');
Route::post('/sacola/whatsapp', [ProductController::class, 'bag'])->middleware('throttle:30,1')->name('bag.whatsapp');
Route::get('/links', [LinksController::class, 'index'])->name('links');
Route::get('/links/ir/{link}', [LinksController::class, 'go'])->middleware('throttle:60,1')->name('links.go');

// ---- Admin ----
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [Admin\AuthController::class, 'create'])->name('login');
        Route::post('login', [Admin\AuthController::class, 'store'])->middleware('throttle:20,1')->name('login.store');
        Route::get('esqueci-senha', [Admin\PasswordResetController::class, 'create'])->name('password.request');
        Route::post('esqueci-senha', [Admin\PasswordResetController::class, 'store'])->middleware('throttle:5,1')->name('password.email');
        Route::get('redefinir-senha/{token}', [Admin\PasswordResetController::class, 'edit'])->name('password.reset');
        Route::post('redefinir-senha', [Admin\PasswordResetController::class, 'update'])->middleware('throttle:10,1')->name('password.update');
    });

    Route::middleware('auth')->group(function () {
        Route::post('logout', [Admin\AuthController::class, 'destroy'])->name('logout');
        Route::get('/', Admin\DashboardController::class)->name('dashboard');

        // Produtos
        Route::post('produtos/massa', [Admin\ProductController::class, 'bulk'])->name('products.bulk');
        Route::post('produtos/{product}/duplicar', [Admin\ProductController::class, 'duplicate'])->name('products.duplicate');
        Route::resource('produtos', Admin\ProductController::class)->except('show')
            ->parameters(['produtos' => 'product'])->names('products');
        Route::post('produtos/{product}/imagens', [Admin\ProductImageController::class, 'store'])->name('images.store');
        Route::post('produtos/{product}/imagens/ordem', [Admin\ProductImageController::class, 'reorder'])->name('images.reorder');
        Route::patch('imagens/{image}', [Admin\ProductImageController::class, 'update'])->name('images.update');
        Route::post('imagens/{image}/capa', [Admin\ProductImageController::class, 'cover'])->name('images.cover');
        Route::delete('imagens/{image}', [Admin\ProductImageController::class, 'destroy'])->name('images.destroy');

        // Categorias
        Route::post('categorias/ordem', [Admin\CategoryController::class, 'reorder'])->name('categories.reorder');
        Route::resource('categorias', Admin\CategoryController::class)->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['categorias' => 'category'])->names('categories');

        // Atributos (tamanhos / cores)
        Route::get('atributos', [Admin\AttributeController::class, 'index'])->name('attributes.index');
        Route::post('atributos/{type}', [Admin\AttributeController::class, 'store'])->name('attributes.store');
        Route::post('atributos/{type}/ordem', [Admin\AttributeController::class, 'reorder'])->name('attributes.reorder');
        Route::put('atributos/{type}/{id}', [Admin\AttributeController::class, 'update'])->name('attributes.update');
        Route::delete('atributos/{type}/{id}', [Admin\AttributeController::class, 'destroy'])->name('attributes.destroy');

        // Tabelas de medidas
        Route::resource('medidas', Admin\MeasurementTableController::class)->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['medidas' => 'measurement'])->names('measurements');

        // Linktree
        Route::post('links/ordem', [Admin\LinkController::class, 'reorder'])->name('links.reorder');
        Route::post('links/aparencia', [Admin\LinkController::class, 'settings'])->name('links.settings');
        Route::resource('links', Admin\LinkController::class)->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['links' => 'link'])->names('links');

        // Banners
        Route::post('banners/ordem', [Admin\BannerController::class, 'reorder'])->name('banners.reorder');
        Route::resource('banners', Admin\BannerController::class)->only(['index', 'store', 'update', 'destroy'])->names('banners');

        // Páginas
        Route::resource('paginas', Admin\PageController::class)->except('show')
            ->parameters(['paginas' => 'page'])->names('pages');

        // Usuários e conta
        Route::resource('usuarios', Admin\UserController::class)->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['usuarios' => 'user'])->names('users');
        Route::get('conta', [Admin\ProfileController::class, 'edit'])->name('profile');
        Route::put('conta', [Admin\ProfileController::class, 'update'])->name('profile.update');

        // Configurações
        Route::get('configuracoes/{group?}', [Admin\SettingsController::class, 'edit'])->name('settings');
        Route::post('configuracoes/{group}', [Admin\SettingsController::class, 'update'])->name('settings.update');
    });
});

// Páginas institucionais e URL curta do Linktree (por último)
Route::get('/{slug}', [PageController::class, 'show'])->where('slug', '[a-z0-9-_]+')->name('pages.show');
