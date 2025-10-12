<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'stripe_connect_id')) {
                $table->string('stripe_connect_id')->nullable()->after('remember_token');
            }
            $table->boolean('payments_enabled')->default(false)->after('stripe_connect_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'payments_enabled')) {
                $table->dropColumn('payments_enabled');
            }
        });
    }
};
