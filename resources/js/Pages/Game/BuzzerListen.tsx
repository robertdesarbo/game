import {useEffect} from "react";
import Echo from "laravel-echo";

export default function BuzzerListen({id, listenerCallback}: {id: string, listenerCallback: any}) {
    const options = {
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: false,
        encrypted: true,
    };

    useEffect(() => {
        const echo = new Echo(options);
        echo.channel('buzzer')
            .listen(`.game.room.${id}.buzzer`, (data: any) => {
                listenerCallback(data);
            });

        return () => {
            echo.channel('buzzer').stopListening(`.game.room.${id}.buzzer`);
        }
    }, [listenerCallback]);

    return (
        <>
        </>
    );
}
