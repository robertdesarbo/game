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

        // Get scores of currently buzzed in users
        $team_scores = collect(json_decode(Redis::get('buzzer:game:room:'.$id.':score') ?? ''));

        return Inertia::render('Game/GameRoom', [
            'game' => $game_room->game,
            'metaData' => $game_room->universe->meta_data,
            'teams' => $game_room->teams,
            'scores' => $team_scores
        ]);
    }

    public function leave(Request $request): RedirectResponse
    {
        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/')->withCookie(\Cookie::forget('game_room_jwt'));
    }

    public function joinRoom(Request $request, int $id): RedirectResponse
    {
        // Update JWT
        $payload = [
            'joined_room' => true,
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
        $buzzer_users = collect(json_decode(Redis::get($buzzer_key) ?? ''));

        // Prevent duplicate buzzers
        $has_team_buzzed_in = $buzzer_users->contains(function (object $user, int $key) use($request) {
            return $user->teamName === $request->get('team_name');
        });

        if (!$has_team_buzzed_in) {
            // Make sure we only store 1 team buzzed in
            $unique_users = $buzzer_users->unique('teamName');

            // Save list of buzzed in users
            // Remove duplicates of same team if they exist
            Redis::set($buzzer_key, $unique_users->add([
                'name' => $request->get('user'),
                'teamName' => $request->get('team_name')
            ])->toJson());

            $game_room = GameRoom::where('id', $id) ->first();

            Buzzer::dispatch($game_room, $unique_users->toArray());
        }
    }

    public function answer(Request $request, int $id): JsonResponse
    {
        $game_score_key = 'buzzer:game:room:'.$id.':score';

        $team_id = (int) $request->team_id;
        $is_correct = $request->is_correct;
        $amount = $request->amount;

        // Get scores of currently buzzed in users
        $team_scores = collect(json_decode(Redis::get($game_score_key) ?? ''));

        $team_scores = $team_scores->where('team_id', $team_id)
                            ->pipeThrough(function (Collection $team_score) use ($is_correct, $amount, $team_id) {
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
