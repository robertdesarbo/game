<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureGameTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (empty($request->cookie('game_room_jwt'))) {
            return redirect('/');
        }

        try {
            $user_game_room = JWT::decode($request->cookie('game_room_jwt'), new Key(env('JWT_SECRET_KEY'), 'HS256'));

            if ((int)$user_game_room->game_room_id !== (int)$request->route('id')) {
                return redirect('/');
            }

            $request->merge([
                'user' => $user_game_room->name ?? '',
                'team_name' => $user_game_room->team_name ?? ''
            ]);

            return $next($request);
        } catch (LogicException $e) {
            // errors having to do with environmental setup or malformed JWT Keys
        } catch (UnexpectedValueException $e) {
            // errors having to do with JWT signature and claims
        }

        return redirect('/');
    }
}
