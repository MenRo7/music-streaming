<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMusicTable extends Migration
{
    public function up()
    {
        Schema::create('music', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('audio');
            $table->string('image')->nullable();
            $table->string('artist_name');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('music');
    }
}
