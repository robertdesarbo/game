<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GameRoomController extends Controller {
    public function __invoke(Request $request, string $id): Response
    {
        $gameRoom = GameRoom::with(['universe', 'teams'])
            ->where('id', $id)
            ->first();

        return Inertia::render('Game/GameRoom', [
            'game' => $gameRoom->game,
            'game_instructions' => $gameRoom->universe->meta_data,
            'teams' => $gameRoom->teams
        ]);
    }
}
