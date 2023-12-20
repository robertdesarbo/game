import {Head, useForm} from "@inertiajs/react";
import {Buzzer as BuzzerType} from "@/types/gameRoom";
import { useState } from "react";
import BuzzerListen from "@/Pages/Game/BuzzerListen";

export default function Buzzer(buzzer: BuzzerType) {
    const { post } = useForm({
        id: buzzer.gameRoom.id,
        user: buzzer.user,
        team_name: buzzer.teamName,
    });

    const options = {
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: false,
        encrypted: true,
    };

    const [isClicked, setIsClicked] = useState(false);

    const submitBuzz = () => {
        if (isClicked) {
            // Prevent spam
            return;
        }

        post((`/game/${buzzer.gameRoom.id}/buzzer`), {
            preserveScroll: true
        });

        setIsClicked(true);
    };

    const listenerCallback = (data: any) => {
        console.log('here');
        console.log(data);
    };

    return (
        <>
            <Head title="Game Room"/>
            <BuzzerListen id={buzzer.gameRoom.id} listenerCallback={listenerCallback}/>
            <form
                className={`h-screen w-screen transition duration-150 ease-out ${ isClicked ? 'bg-green-400' : 'bg-amber-50'}`}
                onDoubleClickCapture={() => {submitBuzz()}}
            >
            </form>
        </>
    );
}
