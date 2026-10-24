<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('image_path')->nullable();
            $table->string('image_alt')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('sizes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('colors', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('hex', 7);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('measurement_tables', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            // { "columns": ["Busto", "Cintura"], "rows": [{"label": "P", "values": ["80", "60"]}] }
            $table->json('content')->nullable();
            $table->timestamps();
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('measurement_table_id')->nullable()->after('parent_id')->constrained()->nullOnDelete();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('measurement_table_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->nullable()->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->timestamp('sale_starts_at')->nullable();
            $table->timestamp('sale_ends_at')->nullable();
            $table->string('status')->default('draft'); // draft, active, sold_out, archived
            $table->boolean('is_featured')->default(false);
            $table->boolean('track_stock')->default(false);
            $table->text('composition')->nullable();
            $table->text('care')->nullable();
            $table->text('measurements_note')->nullable();
            $table->text('notes')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('order_clicks_count')->default(0);
            $table->timestamps();

            $table->index(['status', 'is_featured']);
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('product_tag', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['product_id', 'tag_id']);
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('size_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('color_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('stock')->nullable(); // null = sem controle de estoque
            $table->timestamps();
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('path'); // diretório base das variações geradas
            $table->string('alt')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_cover')->default(false);
            $table->string('placeholder', 16)->nullable(); // cor média para placeholder
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['product_images', 'product_variants', 'product_tag', 'tags', 'products', 'measurement_tables', 'colors', 'sizes', 'categories'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
