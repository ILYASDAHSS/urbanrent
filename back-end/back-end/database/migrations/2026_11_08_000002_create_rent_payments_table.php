<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rent_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rental_application_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tenant_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('host_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('property_title');
            $table->string('city');
            $table->string('owner_name');
            $table->string('owner_email');
            $table->string('tenant_name');
            $table->string('tenant_email');
            $table->string('period', 7);
            $table->unsignedBigInteger('amount_cents');
            $table->string('currency', 3)->default('usd');
            $table->string('method');
            $table->string('status')->default('pending');
            $table->string('checkout_session_id')->nullable()->unique();
            $table->text('checkout_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['rental_application_id', 'period']);
            $table->index('period');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rent_payments');
    }
};
