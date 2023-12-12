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
        Schema::create('game_room_teams', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('game_room_id');
            $table->string('team_name')->unique();
            $table->timestamps();

            $table->foreign('game_room_id')->references('id')->on('game_rooms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_room_teams');
    }
};
