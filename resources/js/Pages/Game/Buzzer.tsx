import {Head, useForm} from "@inertiajs/react";
import {Buzzer as BuzzerType} from "@/types/gameRoom";
import { useState, useMemo } from "react";
import BuzzerListen from "@/Pages/Game/BuzzerListen";
import BuzzableListen from "@/Pages/Game/BuzzableListen";

export enum BuzzerStatus {
    Enabled,
    Disabled,
    Clicked
}

export default function Buzzer(buzzer: BuzzerType) {
    const { post } = useForm({
        id: buzzer.gameRoom.id,
    });

    const [buzzerStatus, setBuzzerStatus] = useState(BuzzerStatus.Disabled);

    const submitBuzz = () => {
        if (buzzerStatus === BuzzerStatus.Disabled || buzzerStatus === BuzzerStatus.Clicked) {
            // Clicker disabled or preventing spam
            return;
        }

        setBuzzerStatus(BuzzerStatus.Clicked);

        post((`/game/${buzzer.gameRoom.id}/buzzer`), {
            preserveScroll: true
        });
    };

    const BuzzerListenerCallback = (data: any) => {
        console.log(data);
    };

    const BuzzableListenerCallback = (data: any) => {
        if (data.buzzable) {
            setBuzzerStatus(BuzzerStatus.Enabled);
        } else {
            setBuzzerStatus(BuzzerStatus.Disabled);
        }
    };

    const buzzerBackgroundClass = useMemo(() => {
        if(buzzerStatus === BuzzerStatus.Disabled) {
            return 'bg-red-400';
        } else if(buzzerStatus === BuzzerStatus.Enabled) {
            return 'bg-amber-400';
        }

        return 'bg-green-400';
    }, [buzzerStatus]);

    return (
        <>
            <Head title="Game Room"/>
            <BuzzerListen id={buzzer.gameRoom.id} listenerCallback={BuzzerListenerCallback}/>
            <BuzzableListen id={buzzer.gameRoom.id} listenerCallback={BuzzableListenerCallback}/>
            <form
                className={`h-screen w-screen transition duration-150 ease-out ${buzzerBackgroundClass}`}
                onClick={() => {submitBuzz()}}
            >
            </form>
        </>
    );
}
