<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAlbumIdToMusicTable extends Migration
{
    public function up()
    {
        Schema::table('music', function (Blueprint $table) {
            $table->foreignId('album_id')->nullable()->constrained()->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('music', function (Blueprint $table) {
            $table->dropColumn('album_id');
        });
    }
}
