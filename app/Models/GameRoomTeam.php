<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameRoomTeam extends Model
{
    use HasFactory;

    public function gameRoom(): BelongsTo
    {
        return $this->belongsTo(GameRoom::class);
    }
}