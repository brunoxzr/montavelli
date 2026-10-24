<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Banners/Index', [
            'banners' => Banner::orderBy('position')->get()->map(fn ($b) => [
                ...$b->only('id', 'title', 'subtitle', 'link_url', 'button_label', 'image_alt', 'is_active'),
                'image' => ImageService::url($b->image_path, 'sm'),
                'mobile' => ImageService::url($b->mobile_image_path, 'sm'),
            ]),
        ]);
    }

    public function store(Request $request, ImageService $images): RedirectResponse
    {
        $this->save(new Banner, $request, $images);

        return back()->with('success', 'Banner criado.');
    }

    public function update(Request $request, Banner $banner, ImageService $images): RedirectResponse
    {
        $this->save($banner, $request, $images);

        return back()->with('success', 'Banner salvo.');
    }

    public function destroy(Banner $banner, ImageService $images): RedirectResponse
    {
        $images->delete($banner->image_path);
        $images->delete($banner->mobile_image_path);
        $banner->delete();

        return back()->with('success', 'Banner excluído.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        foreach ($request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'] as $i => $id) {
            Banner::whereKey($id)->update(['position' => $i]);
        }

        return back();
    }

    private function save(Banner $banner, Request $request, ImageService $images): void
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:120'],
            'subtitle' => ['nullable', 'string', 'max:200'],
            'link_url' => ['nullable', 'string', 'max:500', 'regex:#^(https?://|/)#i'],
            'button_label' => ['nullable', 'string', 'max:40'],
            'image_alt' => ['nullable', 'string', 'max:160'],
            'is_active' => ['boolean'],
            'image' => [$banner->image_path ? 'nullable' : 'required', ...ImageService::rules()],
            'image_crop' => ['nullable', 'array'],
            'mobile_image' => ['nullable', ...ImageService::rules()],
            'mobile_image_crop' => ['nullable', 'array'],
            'remove_mobile' => ['boolean'],
        ], [], ['image' => 'imagem', 'link_url' => 'link']);

        if ($request->hasFile('image')) {
            $images->delete($banner->image_path);
            $banner->image_path = $images->store($request->file('image'), 'banner', $data['image_crop'] ?? null)['path'];
        }
        if ($request->hasFile('mobile_image') || ($data['remove_mobile'] ?? false)) {
            $images->delete($banner->mobile_image_path);
            $banner->mobile_image_path = $request->hasFile('mobile_image')
                ? $images->store($request->file('mobile_image'), 'banner_mobile', $data['mobile_image_crop'] ?? null)['path']
                : null;
        }

        unset($data['image'], $data['image_crop'], $data['mobile_image'], $data['mobile_image_crop'], $data['remove_mobile']);
        if (! $banner->exists) {
            $data['position'] = (int) Banner::max('position') + 1;
        }
        $banner->fill($data)->save();
    }
}
