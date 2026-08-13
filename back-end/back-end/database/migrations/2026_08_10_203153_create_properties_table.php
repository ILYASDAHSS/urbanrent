<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('address');
            $table->string('city');
            $table->string('neighborhood');
            $table->string('zip_code');
            $table->integer('price');
            $table->string('beds'); // supports studio or integer number
            $table->double('baths');
            $table->integer('sqft');
            $table->string('image');
            $table->text('gallery')->nullable(); // JSON array
            $table->string('badge')->nullable();
            $table->string('type');
            $table->boolean('pet_friendly')->default(false);
            $table->boolean('in_unit_laundry')->default(false);
            $table->boolean('parking')->default(false);
            $table->boolean('balcony')->default(false);
            $table->boolean('gym')->default(false);
            $table->boolean('pool')->default(false);
            $table->boolean('ev_charging')->default(false);
            $table->text('description');
            $table->double('rating')->default(5.0);
            $table->integer('review_count')->default(0);
            $table->double('lat');
            $table->double('lng');
            $table->text('amenities')->nullable(); // JSON array
            $table->integer('deposit')->nullable();
            $table->string('lease_terms')->nullable();
            $table->string('available_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
