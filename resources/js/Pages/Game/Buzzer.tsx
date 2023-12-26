import {Head, useForm} from "@inertiajs/react";
import {Buzzer as BuzzerType} from "@/types/gameRoom";
import {useState, useMemo, useEffect} from "react";
import BuzzerListen from "@/Pages/Game/BuzzerListen";
import BuzzableListen from "@/Pages/Game/BuzzableListen";
import {Drawer, message} from "antd";

export enum BuzzerStatus {
    Enabled,
    Disabled,
    Clicked
}

export default function Buzzer(buzzer: BuzzerType) {
    const { post } = useForm({
        id: buzzer.gameRoom.id,
    });

    const [messageApi, contextHolder] = message.useMessage();

    const [buzzerEnabledTime, setBuzzerEnabledTime] = useState<number|null>(null);
    const [buzzerStatus, setBuzzerStatus] = useState<BuzzerStatus>(buzzer.buzzable ? BuzzerStatus.Enabled : BuzzerStatus.Disabled);

    useEffect(() => {
        if (buzzerStatus === BuzzerStatus.Enabled) {
            setBuzzerEnabledTime(Date.now());
        }
    }, [buzzerStatus]);

    const submitBuzz = () => {
        if (buzzerStatus === BuzzerStatus.Disabled || buzzerStatus === BuzzerStatus.Clicked) {
            // Clicker disabled or preventing spam
            return;
        }

        setBuzzerStatus(BuzzerStatus.Clicked);

        window.axios.post((`/game/${buzzer.gameRoom.id}/buzzer`), {
            buzzer_enabled_milliseconds: buzzerEnabledTime,
            buzzer_submitted_milliseconds: Date.now(),
        }).then(() => {
            messageApi.open({
                type: 'success',
                content: 'You buzzed in',
            });
        });
    };

    const BuzzerListenerCallback = (data: any) => {
        //
    };

    const BuzzableListenerCallback = (data: any) => {
        console.log(data);
        if (data.buzzable) {
            setBuzzerStatus(BuzzerStatus.Enabled);
        } else {
            setBuzzerStatus(BuzzerStatus.Disabled);
        }
    };

    const buzzerBackgroundClass = useMemo(() => {
        if(buzzerStatus === BuzzerStatus.Disabled) {
            return 'bg-red-100';
        } else if(buzzerStatus === BuzzerStatus.Enabled) {
            return 'animate-pulse bg-blue-100';
        }

        return 'bg-green-100';
    }, [buzzerStatus]);

    return (
        <>
            <Head title="Game Room"/>
            <BuzzerListen id={buzzer.gameRoom.id} listenerCallback={BuzzerListenerCallback}/>
            <BuzzableListen id={buzzer.gameRoom.id} listenerCallback={BuzzableListenerCallback}/>
            {contextHolder}
            <form
                className={`h-screen w-screen transition duration-150 ease-out ${buzzerBackgroundClass}`}
                onClick={() => {submitBuzz()}}
            >
            </form>
            <Drawer
                placement="bottom"
                open={true}
                height={75}
                closeIcon={false}
                mask={false}
            >
                <div>
                    {buzzer.user.name} ({buzzer.user.team.team_name})
                </div>
            </Drawer>
        </>
    );
}
