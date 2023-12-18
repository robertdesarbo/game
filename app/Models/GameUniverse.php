<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GameUniverse extends Model
{
    use HasFactory;

    protected $table = 'game_universe';

    public function room(): HasOne
    {
        return $this->HasOne(GameRoom::class);
    }
}
