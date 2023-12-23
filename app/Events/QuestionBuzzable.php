<?php

namespace App\Events;

use App\Models\GameRoom;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

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
        return [
            "buzzable" => $this->is_buzzable,
        ];
    }
}
