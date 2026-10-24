@php
    $settings = app(\App\Services\SettingsService::class);
    $s = $settings->all();
    $meta = $meta ?? [];
    $title = ($meta['title'] ?? null) && ($meta['title'] !== $s['store_name']) ? $meta['title'].' | '.$s['store_name'] : $s['store_name'];
    $description = $meta['description'] ?? $s['seo_description'];
    $image = $meta['image'] ?? asset('brand/logo-original.png');
    $favicon = $s['favicon'] ? \Illuminate\Support\Facades\Storage::disk(config('montavelli.disk'))->url($s['favicon']) : '/brand/favicon.png';
    $radius = ['none' => '0px', 'sm' => '4px', 'md' => '10px', 'lg' => '18px'][$s['radius']] ?? '0px';
    $heading = $s['font_heading'] === 'cinzel' ? "'Cinzel'" : "'Cormorant Garamond'";
@endphp
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="{{ $s['color_white'] }}">
    <title inertia>{{ $title }}</title>
    @if($description)
        <meta name="description" content="{{ \Illuminate\Support\Str::limit($description, 300) }}">
    @endif
    <meta property="og:site_name" content="{{ $s['store_name'] }}">
    <meta property="og:title" content="{{ $title }}">
    @if($description)<meta property="og:description" content="{{ \Illuminate\Support\Str::limit($description, 300) }}">@endif
    <meta property="og:type" content="{{ $meta['type'] ?? 'website' }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="{{ str_starts_with($image, 'http') ? $image : url($image) }}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" href="{{ url()->current() }}">
    <link rel="icon" type="image/png" href="{{ $favicon }}">
    <link rel="apple-touch-icon" href="{{ $favicon }}">
    <style>
        :root {
            --brand-ink: {{ $s['color_black'] }};
            --brand-champagne: {{ $s['color_champagne'] }};
            --brand-paper: {{ $s['color_white'] }};
            --brand-soft: {{ $s['color_offwhite'] }};
            --brand-serif: {!! $heading !!}, Georgia, serif;
            --radius: {{ $radius }};
        }
    </style>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
    @if(!empty($s['head_scripts']) && !request()->is('admin', 'admin/*'))
        {!! $s['head_scripts'] !!}
    @endif
</head>
<body>
    @inertia
</body>
</html>
