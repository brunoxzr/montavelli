<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\Size;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductAdminTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create();
    }

    public function test_guest_cannot_access_products(): void
    {
        $this->get('/admin/produtos')->assertRedirect('/admin/login');
        $this->post('/admin/produtos', ['name' => 'X'])->assertRedirect('/admin/login');
    }

    public function test_create_product_with_variants_and_tags(): void
    {
        $size = Size::create(['name' => 'M']);
        $color = Color::create(['name' => 'Preto', 'hex' => '#000000']);
        $category = Category::create(['name' => 'Camisas', 'slug' => 'camisas']);

        $this->actingAs($this->admin())->post('/admin/produtos', [
            'name' => 'Camisa Linho Ávila',
            'status' => 'active',
            'price' => '299.90',
            'sale_price' => '249.90',
            'category_id' => $category->id,
            'track_stock' => true,
            'is_featured' => true,
            'tags' => ['linho', 'verão'],
            'variants' => [['size_id' => $size->id, 'color_id' => $color->id, 'stock' => 3]],
        ])->assertRedirect();

        $product = Product::firstOrFail();
        $this->assertSame('camisa-linho-avila', $product->slug);
        $this->assertSame(3, $product->variants->first()->stock);
        $this->assertCount(2, $product->tags);
    }

    public function test_validation_rejects_sale_price_higher_than_price(): void
    {
        $this->actingAs($this->admin())->post('/admin/produtos', [
            'name' => 'X', 'status' => 'active', 'price' => 100, 'sale_price' => 150,
        ])->assertSessionHasErrors('sale_price');
    }

    public function test_update_duplicate_bulk_and_delete(): void
    {
        $admin = $this->admin();
        $p = Product::create(['name' => 'Calça', 'slug' => 'calca', 'status' => 'draft']);

        $this->actingAs($admin)->put("/admin/produtos/{$p->id}", ['name' => 'Calça Alfaiataria', 'slug' => 'calca', 'status' => 'active'])
            ->assertSessionHasNoErrors();
        $this->assertSame('Calça Alfaiataria', $p->fresh()->name);

        $this->post("/admin/produtos/{$p->id}/duplicar")->assertRedirect();
        $copy = Product::where('slug', 'calca-copia')->firstOrFail();
        $this->assertSame('draft', $copy->status);

        $this->post('/admin/produtos/massa', ['ids' => [$p->id, $copy->id], 'action' => 'sold_out']);
        $this->assertSame(2, Product::where('status', 'sold_out')->count());

        $this->delete("/admin/produtos/{$p->id}")->assertRedirect('/admin/produtos');
        $this->assertNull(Product::find($p->id));
    }

    public function test_image_upload_generates_standardized_variants(): void
    {
        Storage::fake('public');
        $p = Product::create(['name' => 'Blazer', 'slug' => 'blazer', 'status' => 'active']);

        $this->actingAs($this->admin())->post("/admin/produtos/{$p->id}/imagens", [
            'image' => UploadedFile::fake()->image('foto.jpg', 1200, 900),
            'alt' => 'Blazer preto',
            'crop' => ['x' => 100, 'y' => 0, 'width' => 720, 'height' => 900],
        ])->assertSessionHasNoErrors();

        $image = $p->images()->firstOrFail();
        $this->assertTrue($image->is_cover);
        foreach (['thumb', 'card', 'gallery', 'zoom'] as $variant) {
            Storage::disk('public')->assertExists("{$image->path}/$variant.webp");
            Storage::disk('public')->assertExists("{$image->path}/$variant.jpg");
        }
        // proporção 4:5 exata
        [$w, $h] = getimagesizefromstring(Storage::disk('public')->get("{$image->path}/card.jpg"));
        $this->assertSame([600, 750], [$w, $h]);
    }

    public function test_image_upload_rejects_non_images(): void
    {
        Storage::fake('public');
        $p = Product::create(['name' => 'Blazer', 'slug' => 'blazer', 'status' => 'active']);

        $this->actingAs($this->admin())->post("/admin/produtos/{$p->id}/imagens", [
            'image' => UploadedFile::fake()->create('virus.php', 10, 'application/x-php'),
        ])->assertSessionHasErrors('image');
    }

    public function test_public_pages_only_show_visible_products(): void
    {
        Product::create(['name' => 'Rascunho', 'slug' => 'rascunho', 'status' => 'draft']);
        Product::create(['name' => 'Ativo', 'slug' => 'ativo', 'status' => 'active']);

        $this->get('/produtos/rascunho')->assertNotFound();
        $this->get('/produtos/ativo')->assertOk();
        $this->get('/produtos')->assertOk()->assertSee('Ativo')->assertDontSee('Rascunho');
    }
}
