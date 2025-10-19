<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMusicsTable extends Migration
{
    public function up()
    {
        Schema::create('music', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('album_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->string('audio');
            $table->string('image')->nullable();
            $table->string('artist_name');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('musics');
    }
}
