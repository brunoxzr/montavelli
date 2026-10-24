<?php

return [
    // Disco das imagens: "public" (local) por padrão. Troque para "s3" se quiser (opcional).
    'disk' => env('MONTAVELLI_DISK', 'public'),

    'max_upload_kb' => (int) env('MONTAVELLI_MAX_UPLOAD_KB', 8192),

    /*
     * Perfis de imagem. "ratio" null = usa a proporção configurada no admin.
     * Cada largura gera um .webp e um .jpg (fallback).
     */
    'images' => [
        'product' => ['ratio' => null, 'sizes' => ['thumb' => 160, 'card' => 600, 'gallery' => 1080, 'zoom' => 1600]],
        'category' => ['ratio' => null, 'sizes' => ['card' => 600]],
        'banner' => ['ratio' => [16, 9], 'sizes' => ['sm' => 768, 'lg' => 1600]],
        'banner_mobile' => ['ratio' => [4, 5], 'sizes' => ['sm' => 768]],
        'avatar' => ['ratio' => [1, 1], 'sizes' => ['sm' => 256]],
    ],
];
