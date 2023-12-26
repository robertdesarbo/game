<?php

namespace App\Events;

use App\Models\GameRoom;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use App\Helpers\BuzzableHelper;

class QuestionBuzzable implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    /**
     * Create a new event instance.
     */
    public function __construct(
        private GameRoom $game_room, private bool $is_buzzable
    ) {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): Channel
    {
        return new Channel('buzzable');
    }

    public function broadcastAs(): string
    {
        return 'game.room.'.$this->game_room->id.'.question.buzzable';
    }

    public function broadcastWith()
    {
        // Wait 2 seconds before opening up the buzzer
        if ($this->is_buzzable) {
            sleep(2);
        }

        BuzzableHelper::save($this->game_room->id, collect()->push(['buzzable' => $this->is_buzzable]));

        return [
            "buzzable" => $this->is_buzzable,
        ];
    }
}
