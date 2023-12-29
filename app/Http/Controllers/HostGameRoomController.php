<?php
namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Models\GameRoomTeam;
use App\Events\Buzzer;
use App\Events\QuestionBuzzable;
use App\Helpers\BuzzerHelper;
use App\Helpers\ScoreHelper;
use App\Helpers\AnsweredHelper;
use App\Helpers\BuzzableHelper;
use Firebase\JWT\JWT;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class HostGameRoomController extends Controller {
    public function __invoke(Request $request, int $id): Response
    {
        $game_room = GameRoom::with(['universe', 'teams'])
            ->where('id', $id)
            ->first();

        return Inertia::render('Game/GameRoom', [
            'id' => $id,
            'game' => $game_room->game,
            'metaData' => $game_room->universe->meta_data,
            'teams' => $game_room->teams,
            'scores' => ScoreHelper::get($id),
            'questionsAnswered' => AnsweredHelper::get($id)
        ]);
    }

    public function buzzable(Request $request, int $id): void
    {
        // Clear buzzer queue
        BuzzerHelper::delete($id);
        BuzzableHelper::delete($id);

        $game_room = GameRoom::where('id', $id) ->first();

        QuestionBuzzable::dispatch($game_room, (bool) $request->get('is_buzzable'));
    }

    public function answerWithoutScore(Request $request, int $id): JsonResponse
    {
        $game_room = GameRoom::where('id', $id) ->first();
        QuestionBuzzable::dispatch($game_room, false);

        $questions_answered = AnsweredHelper::get($id);
        $questions_answered->push($request->question);

        AnsweredHelper::save($id, $questions_answered->toJson());

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
        $team_scores = ScoreHelper::get($id);

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

        ScoreHelper::save($id, $team_scores);

        $questions_answered = AnsweredHelper::get($id);
        if ($is_correct) {
            // Mark question as answered
            $questions_answered->push($question);

            AnsweredHelper::save($id, $questions_answered->toJson());
        }

        // Update Score
        return response()->json([
            'score' => $team_scores->firstWhere('team_id', $team_id)->score,
            'questionsAnswered' => $questions_answered,
        ]);
    }
}
