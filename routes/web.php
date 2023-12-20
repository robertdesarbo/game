<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\GameRoomController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('game.room.valid')->group(function () {
    Route::post('/game/{id}', [GameRoomController::class, 'joinRoom'])
        ->name('game');
    Route::get('/game/{id}/buzzer', [GameRoomController::class, 'buzzer'])
        ->name('buzzer');
    Route::post('/game/{id}/buzzer', [GameRoomController::class, 'incomingBuzzer'])
        ->name('buzzer.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/game/{id}', [GameRoomController::class, '__invoke'])
        ->name('game');
});

require __DIR__.'/auth.php';
