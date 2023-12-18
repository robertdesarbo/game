<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\GameRoom;
use Illuminate\Foundation\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Route;

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

        return redirect()->route('home')->with(
            [
                'game' =>
                [
                    'id' => $gameRoom->id,
                    'hasTeams' => $gameRoom->has_teams,
                    'teams' => $teams,
                ]
            ]
        );
    }

    public function joinTeam(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('game-room');
    }
}
