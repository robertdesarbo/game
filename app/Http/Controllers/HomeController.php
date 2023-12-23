<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use Firebase\JWT\Key;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Route;
use Firebase\JWT\JWT;

class HomeController extends Controller {
    public function index(Request $request): Response
    {
        $game = null;
        if ($request->session()->get('game')) {
            $game = [
                'id' => $request->session()->get('game.id'),
                'hasTeams' => $request->session()->get('game.hasTeams'),
                'teams' => $request->session()->get('game.teams'),
            ];
        }

        $user_game_room = null;
        if (!empty($request->cookie('game_room_jwt'))) {
            $user_game_room = JWT::decode($request->cookie('game_room_jwt'), new Key(env('JWT_SECRET_KEY'), 'HS256'));
        }

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'userGameRoom' => $user_game_room,
            'game' => $game
        ]);
    }

    public function joinGame(Request $request): RedirectResponse
    {
        $request->validate([
            'gameCode' => 'required|exists:App\Models\GameRoom,code',
        ]);

        $game_room = GameRoom::with('teams')
                        ->where('code', $request->gameCode)
                        ->first();

        $teams = $game_room->teams->map(function ($team) {
            return ['value' => $team->id, 'label' => $team->team_name];
        });

        // Create JWT
        $payload = [
            'joined_room' => false,
            'game_room_id' => $game_room->id,
        ];

        return redirect()->route('home')->with(
            [
                'game' =>
                [
                    'id' => $game_room->id,
                    'hasTeams' => $game_room->has_teams,
                    'teams' => $teams,
                ]
            ]
        )->withCookie(
        'game_room_jwt', JWT::encode($payload, env('JWT_SECRET_KEY'), 'HS256')
        );
    }
}
