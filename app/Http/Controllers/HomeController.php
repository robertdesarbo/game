<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use Illuminate\Foundation\Application;
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

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'game' => $game
        ]);
    }

    public function joinGame(Request $request): RedirectResponse
    {
        $request->validate([
            'gameCode' => 'required|exists:App\Models\GameRoom,code',
        ]);

        $gameRoom = GameRoom::with('teams')
                        ->where('code', $request->gameCode)
                        ->first();

        $teams = $gameRoom->teams->map(function ($team) {
            return ['value' => $team->id, 'label' => $team->team_name];
        });

        // Create JWT
        $payload = [
            'game_room_id' => $gameRoom->id,
        ];

        return redirect()->route('home')->with(
            [
                'game' =>
                [
                    'id' => $gameRoom->id,
                    'hasTeams' => $gameRoom->has_teams,
                    'teams' => $teams,
                ]
            ]
        )->withCookie(
        'game_room_jwt', JWT::encode($payload, env('JWT_SECRET_KEY'), 'HS256')
        );
    }
}
