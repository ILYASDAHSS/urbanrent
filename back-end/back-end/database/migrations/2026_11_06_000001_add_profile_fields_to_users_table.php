<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('city')->nullable()->after('phone');
            $table->string('occupation')->nullable()->after('city');
            $table->text('bio')->nullable()->after('occupation');
            $table->date('move_in_date')->nullable()->after('bio');
            $table->unsignedInteger('budget_min')->nullable()->after('move_in_date');
            $table->unsignedInteger('budget_max')->nullable()->after('budget_min');
            $table->string('pets')->nullable()->after('budget_max');
            $table->unsignedTinyInteger('household_size')->nullable()->after('pets');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'city',
                'occupation',
                'bio',
                'move_in_date',
                'budget_min',
                'budget_max',
                'pets',
                'household_size',
            ]);
        });
    }
};
