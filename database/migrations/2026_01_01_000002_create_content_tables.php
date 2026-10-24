<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->timestamps();
        });

        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('image_path')->nullable();
            $table->string('mobile_image_path')->nullable();
            $table->string('image_alt')->nullable();
            $table->string('link_url')->nullable();
            $table->string('button_label')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('link_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('url')->nullable(); // vazio para links especiais (resolvidos na hora)
            $table->string('icon')->nullable();
            $table->string('kind')->default('custom'); // custom, whatsapp, instagram, catalog
            $table->boolean('is_highlighted')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('position')->default(0);
            $table->unsignedBigInteger('clicks_count')->default(0);
            $table->timestamps();
        });

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('show_in_footer')->default(true);
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['pages', 'link_items', 'banners', 'settings'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
