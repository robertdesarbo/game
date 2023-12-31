<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\HostGameRoomController;
use App\Http\Controllers\PlayerGameRoomController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [HomeController::class, 'index'])
    ->name('home');
Route::post('join-game', [HomeController::class, 'joinGame'])
    ->name('join-game');

Route::get('/dashboard', [DashboardController::class, '__invoke'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/game/{id}', [HostGameRoomController::class, '__invoke'])
        ->name('game');
    Route::post('/game/{id}/buzzable', [HostGameRoomController::class, 'buzzable'])
        ->name('buzzable');
    Route::post('/game/{id}/answer', [HostGameRoomController::class, 'answer'])
        ->name('answer');
    Route::post('/game/{id}/answerWithoutScore', [HostGameRoomController::class, 'answerWithoutScore'])
        ->name('answerWithoutScore');
});

Route::middleware('game.room.valid')->group(function () {
    Route::post('/game/{id}', [PlayerGameRoomController::class, 'joinRoom'])
        ->name('game.post');

    Route::get('/game/{id}/buzzer', [PlayerGameRoomController::class, 'buzzer'])
        ->name('buzzer');
    Route::post('/game/{id}/buzzer', [PlayerGameRoomController::class, 'incomingBuzzer'])
        ->name('buzzer.update');

    Route::post('/game/{id}/leave', [PlayerGameRoomController::class, 'leave'])
        ->name('leave');
});

require __DIR__.'/auth.php';
