<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameRoom extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function universe(): BelongsTo
    {
        return $this->belongsTo(GameUniverse::class, 'id', 'game_room_id');
    }

    public function teams(): HasMany
    {
        return $this->hasMany(GameRoomTeam::class);
    }
}
