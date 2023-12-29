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

class PlayerGameRoomController extends Controller {
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
            'buzzable' => BuzzableHelper::get($id)->contains('buzzable', true)
        ]);
    }

    public function incomingBuzzer(Request $request, int $id): void {
        Buzzer::dispatch($id,
            json_decode($request->get('user')),
            $request->get('buzzer_submitted_milliseconds') - $request->get('buzzer_enabled_milliseconds')
        );
    }
}
