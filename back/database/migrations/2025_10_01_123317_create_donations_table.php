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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('to_user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->integer('amount_cents');
            $table->string('currency', 10)->default('eur');
            $table->string('status')->default('created');
            $table->string('stripe_session_id')->nullable();
            $table->string('stripe_payment_intent')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
