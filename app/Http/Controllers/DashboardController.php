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

class DashboardController extends Controller {
    public function __invoke(Request $request): Response
    {
        $game_rooms = $request->user()->rooms;

        return Inertia::render('Dashboard', [
            'gameRooms' => $game_rooms
        ]);
    }
}
