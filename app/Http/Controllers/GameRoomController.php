<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Events\Buzzer;
use Firebase\JWT\JWT;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Redis;

class GameRoomController extends Controller {
    public function __invoke(Request $request, int $id): Response
    {
        $game_room = GameRoom::with(['universe', 'teams'])
            ->where('id', $id)
            ->first();

        return Inertia::render('Game/GameRoom', [
            'game' => $game_room->game,
            'metaData' => $game_room->universe->meta_data,
            'teams' => $game_room->teams
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
        $game_room = GameRoom::where('id', $id)->first();

        return Inertia::render('Game/Buzzer', [
            'gameRoom' => $game_room,
            'teamName' => $request->get('team_name') ?? '',
            'user' => $request->get('user') ?? '',
        ]);
    }

    public function incomingBuzzer(Request $request, int $id): void
    {
        $buzzer_key = 'buzzer:game:room:'.$id;

        // Get list of currently buzzed in users
        $buzzerUsers = collect(json_decode(Redis::get($buzzer_key) ?? ''));

        // Prevent duplicate buzzers
        $hasTeamBuzzedIn = $buzzerUsers->contains(function (object $user, int $key) use($request) {
            return $user->teamName === $request->get('team_name');
        });

        if (!$hasTeamBuzzedIn) {
            // Make sure we only store 1 team buzzed in
            $uniqueUsers = $buzzerUsers->unique('teamName');

            // Save list of buzzed in users
            // Remove duplicates of same team if they exist
            Redis::set($buzzer_key, $uniqueUsers->add([
                'name' => $request->get('user'),
                'teamName' => $request->get('team_name')
            ])->toJson());

            $game_room = GameRoom::where('id', $id) ->first();

            Buzzer::dispatch($game_room, $uniqueUsers->toArray());
        }
    }

    public function answer(Request $request, int $id): JsonResponse
    {
        $game_score_key = 'buzzer:game:room:'.$id.':score';

        $team_id = $request->team_id;
        $is_correct = $request->is_correct;
        $amount = $request->amount;

        // Get scores of currently buzzed in users
        $team_scores = collect(json_decode(Redis::get($game_score_key) ?? ''));

        $team_scores = $team_scores->where('team_id', $team_id)
                            ->pipeThrough(function (Collection $team_score) use ($is_correct,$amount, $team_id) {
                                $team_score->whenEmpty(function (Collection $collection) use ($team_id) {
                                    return $collection
                                        ->push((object)[
                                            'team_id' => $team_id,
                                            'score' => 0,
                                        ]);
                                });

                                $team_score = $team_score->first();

                                $team_score->score = $is_correct ?
                                    $team_score->score + $amount : $team_score->score - $amount;

                                return collect([$team_score]);
                            });

        Redis::set($game_score_key, $team_scores->toJson());

        // Clear buzzer queue
        if ($is_correct) {
            Redis::del('buzzer:game:room:'.$id);
        }

        // Update Score
        return response()->json(['score' => $team_scores->firstWhere('team_id', $team_id)->score]);
    }
}
