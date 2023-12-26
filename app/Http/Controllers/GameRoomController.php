<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Models\GameRoomTeam;
use App\Events\Buzzer;
use App\Events\QuestionBuzzable;
use App\Helpers\BuzzerHelper;
use App\Helpers\GameRoomHelper;
use Firebase\JWT\JWT;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;
use Inertia\Response;


class GameRoomController extends Controller {
    public function __invoke(Request $request, int $id): Response
    {
        $game_room = GameRoom::with(['universe', 'teams'])
            ->where('id', $id)
            ->first();

        // Get scores of currently buzzed in users
        $team_scores = GameRoomHelper::get($id);

        $questions_answered_key = 'game:room:'.$id.':questions:answered';

        return Inertia::render('Game/GameRoom', [
            'id' => $id,
            'game' => $game_room->game,
            'metaData' => $game_room->universe->meta_data,
            'teams' => $game_room->teams,
            'scores' => $team_scores,
            'questionsAnswered' => collect($questions_answered_key ? json_decode(Redis::get($questions_answered_key)) : [])
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
        $request->validate([
            'team_id' => 'required|exists:App\Models\GameRoomTeam,id',
        ]);

        $game_room_team = GameRoomTeam::where('id', $request->get('team_id'))->first();

        // Update JWT
        $payload = [
            'joined_room' => true,
            'game_room_id' => $id,
            'team' => $game_room_team,
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
            'user' => json_decode($request->get('user')),
        ]);
    }

    public function buzzable(Request $request, int $id): void
    {
        // Clear buzzer queue
        BuzzerHelper::delete($id);

        $game_room = GameRoom::where('id', $id) ->first();

        QuestionBuzzable::dispatch($game_room, (bool) $request->get('is_buzzable'));
    }

    public function incomingBuzzer(Request $request, int $id): void {
        Buzzer::dispatch($id,
            json_decode($request->get('user')),
            $request->get('buzzer_submitted_milliseconds') - $request->get('buzzer_enabled_milliseconds')
        );
    }

    public function answerWithoutScore(Request $request, int $id): JsonResponse
    {
        $game_room = GameRoom::where('id', $id) ->first();
        QuestionBuzzable::dispatch($game_room, false);

        // Mark question as answered
        $questions_answered_key = 'game:room:'.$id.':questions:answered';

        $questions_answered = collect($questions_answered_key ? json_decode(Redis::get($questions_answered_key)) : []);
        $questions_answered->push($request->question);

        Redis::set($questions_answered_key, $questions_answered->toJson());

        // Update Score
        return response()->json([
            'questionsAnswered' => $questions_answered,
        ]);
    }

    public function answer(Request $request, int $id): JsonResponse
    {
        $question = $request->question;
        $is_correct = $request->is_correct;
        $team_id = (int) $request->team_id;
        $amount = $request->amount;

        if ($is_correct) {
            // Turn off Buzzers
            $game_room = GameRoom::where('id', $id) ->first();
            QuestionBuzzable::dispatch($game_room, false);
        }

        // Get scores of currently buzzed in users
        $team_scores = GameRoomHelper::get($id);

        if (!$team_scores->contains('team_id', $team_id)) {
            $team_score = (object)[
                'team_id' => $team_id,
                'score' => $is_correct ? $amount : - $amount,
            ];

            $team_scores->push($team_score);
        } else {
            $team_scores->map(function ($team_score) use($team_id, $is_correct, $amount) {
                if ($team_score->team_id === $team_id) {
                    $team_score->score = $is_correct ?
                        $team_score->score + $amount : $team_score->score - $amount;
                }
            });
        }

        GameRoomHelper::save($id, $team_scores);

        $questions_answered_key = 'game:room:'.$id.':questions:answered';
        $questions_answered = collect($questions_answered_key ? json_decode(Redis::get($questions_answered_key)) : []);
        if ($is_correct) {
            // Mark question as answered
            $questions_answered->push($question);

            Redis::set($questions_answered_key, $questions_answered->toJson());
        }

        // Update Score
        return response()->json([
            'score' => $team_scores->firstWhere('team_id', $team_id)->score,
            'questionsAnswered' => $questions_answered,
        ]);
    }
}
