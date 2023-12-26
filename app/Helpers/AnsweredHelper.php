<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Collection;

class AnsweredHelper
{
    const KEY_PREFIX = 'game:room:';
    const KEY_SUFFIX = ':answered';

    private static function create_key($room_id): string
    {
        return self::KEY_PREFIX.$room_id.self::KEY_SUFFIX;
    }

    public static function delete($room_id): void
    {
        Redis::del(self::create_key($room_id));
    }

    public static function get($room_id): Collection
    {
        // Get game room scores
        return collect(json_decode(Redis::get(self::create_key($room_id)) ?? ''));
    }

    public static function save($room_id, $collection): void
    {
        Redis::set(self::create_key($room_id), $collection->toJson());
    }
}
