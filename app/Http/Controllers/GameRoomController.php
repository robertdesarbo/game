<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Events\Buzzer;
use Firebase\JWT\JWT;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Redis;

class GameRoomController extends Controller {
    public function __invoke(Request $request, int $id): Response
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

    public function joinRoom(Request $request, int $id): RedirectResponse
    {
        // Update JWT
        $payload = [
            'game_room_id' => $id,
            'team_name' => $request->get('team'),
            'name'  => $request->get('name'),
        ];

        return redirect()->route('buzzer', ['id' => $id])
            ->withCookie(
                'game_room_jwt', JWT::encode($payload, env('JWT_SECRET_KEY'), 'HS256')
            );
    }

    public function buzzer(Request $request, int $id): Response
    {
        $gameRoom = GameRoom::where('id', $id)->first();

        return Inertia::render('Game/Buzzer', [
            'gameRoom' => $gameRoom,
            'teamName' => $request->get('team_name') ?? '',
            'user' => $request->get('user') ?? '',
        ]);
    }

    public function incomingBuzzer(Request $request, int $id): void
    {
        $buzzerKey = 'buzzer:game:room:'.$id;

        // Get list of currently buzzed in users
        $buzzerUsers = collect(json_decode(Redis::get($buzzerKey) ?? ''));

        // Prevent duplicate buzzers
        $hasTeamBuzzedIn = $buzzerUsers->contains(function (object $user, int $key) use($request) {
            return $user->teamName === $request->get('team_name');
        });
        
        if (!$hasTeamBuzzedIn) {
            // Make sure we only store 1 team buzzed in
            $uniqueUsers = $buzzerUsers->unique('teamName');

            // Save list of buzzed in users
            // Remove duplicates of same team if they exist
            Redis::set($buzzerKey,  $uniqueUsers->add([
                'name' => $request->get('user'),
                'teamName' => $request->get('team_name')
            ])->toJson());

            $gameRoom = GameRoom::where('id', $id) ->first();

            Buzzer::dispatch($gameRoom, $uniqueUsers->toArray());
        }
    }

    public function answer(Request $request, int $id): void
    {
        $buzzerKey = 'buzzer:game:room:'.$id;

        // Clear buzzer queue
        Redis::del($buzzerKey);

        // Update Score
    }
}
