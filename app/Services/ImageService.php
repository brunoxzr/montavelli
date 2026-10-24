<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\PngEncoder;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Padroniza imagens: recorte (manual ou centralizado) na proporção do perfil,
 * gera as variações em WebP + JPEG e remove metadados (EXIF) ao re-encodar.
 */
class ImageService
{
    public function __construct(private SettingsService $settings) {}

    public static function rules(): array
    {
        return ['image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('montavelli.max_upload_kb')];
    }

    /**
     * @param  array{x?:numeric,y?:numeric,width?:numeric,height?:numeric}|null  $crop  em pixels da imagem original
     * @return array{path:string,placeholder:string}
     */
    public function store(UploadedFile $file, string $profile, ?array $crop = null): array
    {
        $config = config("montavelli.images.$profile");
        [$rw, $rh] = $config['ratio'] ?? $this->settings->ratio();
        $quality = max(40, min(100, (int) $this->settings->get('image_quality', 82)));

        $manager = new ImageManager(new Driver);
        $image = $manager->decodePath($file->getRealPath())->orient();

        if ($crop && ($crop['width'] ?? 0) > 0 && ($crop['height'] ?? 0) > 0) {
            $image->crop(
                (int) round($crop['width']), (int) round($crop['height']),
                (int) round($crop['x'] ?? 0), (int) round($crop['y'] ?? 0),
            );
        }

        $dir = $profile.'/'.now()->format('Y/m').'/'.Str::random(20);
        $disk = Storage::disk(config('montavelli.disk'));

        foreach ($config['sizes'] as $name => $width) {
            $height = (int) round($width * $rh / $rw);
            $variant = (clone $image)->cover($width, $height);
            $disk->put("$dir/$name.webp", (string) $variant->encode(new WebpEncoder(quality: $quality, strip: true)));
            $disk->put("$dir/$name.jpg", (string) $variant->encode(new JpegEncoder(quality: $quality, progressive: true, strip: true)));
        }

        // cor média (placeholder sem layout shift)
        $avg = (clone $image)->resize(1, 1)->colorAt(0, 0)->toHex('#');

        return ['path' => $dir, 'placeholder' => substr($avg, 0, 7)];
    }

    /** Logo/favicon: mantém proporção original e transparência (PNG). */
    public function storeLogo(UploadedFile $file, int $maxWidth = 800): string
    {
        $manager = new ImageManager(new Driver);
        $image = $manager->decodePath($file->getRealPath())->orient()->scaleDown(width: $maxWidth);
        $path = 'brand/'.Str::random(20).'.png';
        Storage::disk(config('montavelli.disk'))->put($path, (string) $image->encode(new PngEncoder));

        return $path;
    }

    public function delete(?string $path): void
    {
        if (! $path) {
            return;
        }
        $disk = Storage::disk(config('montavelli.disk'));
        str_contains(basename($path), '.') ? $disk->delete($path) : $disk->deleteDirectory($path);
    }

    public static function url(?string $dir, string $variant, string $ext = 'webp'): ?string
    {
        return $dir ? Storage::disk(config('montavelli.disk'))->url("$dir/$variant.$ext") : null;
    }

    /** srcset com todas as larguras do perfil. */
    public static function srcset(?string $dir, string $profile, string $ext = 'webp'): ?string
    {
        if (! $dir) {
            return null;
        }

        return collect(config("montavelli.images.$profile.sizes"))
            ->map(fn ($w, $name) => self::url($dir, $name, $ext)." {$w}w")
            ->implode(', ');
    }
}
