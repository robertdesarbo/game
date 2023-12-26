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

            // Helps prevent very laggy users from breaking order of already ranked buzzed in users
            $extra_milliseconds = $buzzer_users->max('milliseconds_to_buzz_in') ?? 0;

            // Save list of buzzed in users
            // Remove duplicates of same team if they exist
            BuzzerHelper::save($this->id, $buzzer_users->add([
                'user_data' => $this->user,
                'milliseconds_to_buzz_in' => $extra_milliseconds + $this->milliseconds_to_buzz_in,
            ]));

            if ($has_team_buzzed_in) {
                // Let teammate know that a member buzzed in before them
            }
        });

        $ordered_users = collect();
        Cache::lock('buzzer:game:room:'.$this->id.':sort:users')->get(function () use(&$ordered_users) {
            // wait for buzzer users to update (500 ms)
            usleep(500 * 1000);

            // Order the buzzed in users
            $teams_buzzer_winner = collect();

            $nf = new NumberFormatter('en_US', NumberFormatter::ORDINAL);
            $ordered_users = BuzzerHelper::get($this->id)
                                ->sortBy('milliseconds_to_buzz_in')
                                ->map(function ($user, $key) use ($nf, $teams_buzzer_winner) {

                                    $winner = $teams_buzzer_winner->where('team_id', $user->user_data->team->id);
                                    if ($winner->isEmpty()) {
                                        $user->teamOrder = $nf->format($teams_buzzer_winner->count()+1);

                                        $teams_buzzer_winner->push((object)[
                                            'team_id' => $user->user_data->team->id,
                                            'teamOrder' => $user->teamOrder
                                        ]);
                                    } else {
                                        $user->teamOrder = $winner->first()->teamOrder;
                                    }

                                    $user->order = $nf->format($key+1);

                                    return $user;
                                });
        });

        return [
            "users" => $ordered_users->toArray(),
        ];
    }
}
