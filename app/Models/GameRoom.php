<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameRoom extends Model
{
    use HasFactory;

    public function user(): HasMany
    {
        return $this->belongsTo(User::class);
    }

    public function gameUniverse(): HasMany
    {
        return $this->hasOne(GameUniverse::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(GameRoomTeam::class);
    }
}
