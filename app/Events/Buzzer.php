<?php

namespace App\Events;

use App\Helpers\BuzzerHelper;
use App\Models\GameRoom;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Support\Facades\Cache;
use \NumberFormatter;

class Buzzer implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    private GameRoom $game_room;

    /**
     * Create a new event instance.
     */
    public function __construct(private int $id,
                                private Object $user,
                                private int $milliseconds_to_buzz_in) {
        $this->game_room = GameRoom::where('id', $id) ->first();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): Channel
    {
        return new Channel('buzzer');
    }

    public function broadcastAs(): string
    {
        return 'game.room.'.$this->game_room->id.'.buzzer';
    }

    public function broadcastWith()
    {
        Cache::lock('buzzer:game:room:'.$this->id.':update')->get(function () {
            // Lock acquired and automatically released...
            $buzzer_users = BuzzerHelper::get($this->id);

            // Prevent duplicate buzzers
            $has_team_buzzed_in = $buzzer_users->contains(function (object $buzzed_user, int $key) {
                return $buzzed_user->user_data->team->team_name === $this->user->team->team_name;
            });

            if (!$has_team_buzzed_in) {
                // Make sure we only store 1 team buzzed in
                $unique_users = $buzzer_users->unique('team_name');

                // Helps prevent very laggy users from breaking order of already ranked buzzed in users
                $extra_milliseconds = $buzzer_users->max('milliseconds_to_buzz_in') ?? 0;

                // Save list of buzzed in users
                // Remove duplicates of same team if they exist
                BuzzerHelper::save($this->id, $unique_users->add([
                    'user_data' => $this->user,
                    'milliseconds_to_buzz_in' => $extra_milliseconds + $this->milliseconds_to_buzz_in,
                ]));
            } else {
                // Let teammate know that a member buzzed in before them
            }
        });

        $ordered_users = collect();
        Cache::lock('buzzer:game:room:'.$this->id.':sort:users')->get(function () use(&$ordered_users) {
            // wait for buzzer users to update (500 ms)
            usleep(500 * 1000);

            // Order the buzzed in users
            $ordered_users = BuzzerHelper::get($this->id)
                                ->sortBy('milliseconds_to_buzz_in')
                                ->map(function ($user, $key) {
                                    $nf = new NumberFormatter('en_US', NumberFormatter::ORDINAL);
                                    $nf->format($key);

                                    $user->order = $nf->format($key+1);

                                    return $user;
                                });
        });

        return [
            "users" => $ordered_users->toArray(),
        ];
    }
}
