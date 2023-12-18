import {Head, useForm} from "@inertiajs/react";
import {Buzzer as BuzzerType} from "@/types/gameRoom";
import { useState, useEffect } from "react";
import Echo from "laravel-echo";

export default function Buzzer(buzzer: BuzzerType) {
    const { post } = useForm({
        id: buzzer.gameRoom.id
    });

    const options = {
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: false,
        encrypted: true,
    };

    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        const echo = new Echo(options);
        echo.channel('buzzer')
            .listen(`.game.room.${buzzer.gameRoom.id}.buzzer`, (e) => {
                console.log(e);
            });
    }, []);

    const submitBuzz = (question) => {
        post((`/game/${buzzer.gameRoom.id}/buzzer`), {
            preserveScroll: true
        });

        setIsClicked(true);
    };

    return (
        <>
            <Head title="Game Room"/>
            <form
                className={`h-screen w-screen transition duration-150 ease-out ${ isClicked ? 'bg-green-400' : 'bg-amber-50'}`}
                onClick={() => {submitBuzz()}}
            >
            </form>
        </>
    );
}
