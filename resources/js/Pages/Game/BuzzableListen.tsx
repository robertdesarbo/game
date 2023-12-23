import { useEffect } from "react";
import Echo from "laravel-echo";

export default function BuzzableListen({id, listenerCallback}: {id: string, listenerCallback: any}) {
    const options = {
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: false,
        encrypted: true,
    };

    useEffect(() => {
        const echo = new Echo(options);
        echo.channel('buzzable')
            .listen(`.game.room.${id}.question.buzzable`, (data: any) => {
                console.log(data);
                listenerCallback(data);
            });
    }, []);

    return (
        <>
        </>
    );
}
