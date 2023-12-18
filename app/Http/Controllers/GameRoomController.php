<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Events\Buzzer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Redis;

class GameRoomController extends Controller {
    public function __invoke(Request $request, string $id): Response
    {
        $gameRoom = GameRoom::with(['universe', 'teams'])
            ->where('id', $id)
            ->first();

        return Inertia::render('Game/GameRoom', [
            'game' => $gameRoom->game,
            'metaData' => $gameRoom->universe->meta_data,
            'teams' => $gameRoom->teams
        ]);
    }

    public function buzzer(Request $request, string $id): Response
    {
        $gameRoom = GameRoom::where('id', $id) ->first();

        return Inertia::render('Game/Buzzer', [
            'gameRoom' => $gameRoom
        ]);
    }

    public function incomingBuzzer(Request $request, string $id): void
    {
        $buzzerKey = 'buzzer:game:room:'.$id;

        // Get list of currently buzzed in users
        $buzzerUsers = collect(json_decode(Redis::get($buzzerKey) ?? '', true));

        // Prevent duplicate buzzers
        if(!$buzzerUsers->contains('Bert')) {
            $buzzerUsers->add('Desk');
            $buzzerUsers->add('Bert');
        }

        // Save list of buzzed in users
        Redis::set($buzzerKey, $buzzerUsers->toJson());

        $gameRoom = GameRoom::where('id', $id) ->first();

        Buzzer::dispatch($gameRoom, $buzzerUsers->toArray());
    }

    public function answer(Request $request, string $id): void
    {
        $buzzerKey = 'buzzer:game:room:'.$id;

        // Clear buzzer queue
        Redis::del($buzzerKey);

        // Update Score
    }
}
