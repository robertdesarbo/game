<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Collection;

class BuzzerHelper
{
    const KEY_PREFIX = 'buzzer:game:room:';
    const KEY_SUFFIX = '';

    private static function create_key($room_id): string
    {
        return self::KEY_PREFIX.$room_id.self::KEY_SUFFIX;
    }

    public static function delete($room_id) : void
    {
        Redis::del(self::create_key($room_id));
    }

    public static function get($room_id) : Collection
    {
        // Get list of currently buzzed in users
        return collect(json_decode(Redis::get(self::create_key($room_id)) ?? ''));
    }

    public static function save($room_id, $collection) : void
    {
        Redis::set(self::create_key($room_id), $collection->toJson());
    }
}
