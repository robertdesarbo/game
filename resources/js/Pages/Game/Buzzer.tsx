import {Head} from "@inertiajs/react";
import {Buzzer as BuzzerType, RedisUser} from "@/types/gameRoom";
import {useState, useMemo, useEffect, useCallback} from "react";
import BuzzerListen from "@/Pages/Game/BuzzerListen";
import BuzzableListen from "@/Pages/Game/BuzzableListen";
import {Drawer, message, notification} from 'antd';

export enum BuzzerStatus {
    Enabled,
    Disabled,
    Clicked
}

export default function Buzzer(buzzer: BuzzerType) {
    const [messageApi, messageContextHolder] = message.useMessage();
    const [notificationApi, notificationContextHolder] = notification.useNotification({
        bottom: 75,
    });

    const [buzzerEnabledTime, setBuzzerEnabledTime] = useState<number|null>(null);
    const [buzzerStatus, setBuzzerStatus] = useState<BuzzerStatus>(buzzer.buzzable ? BuzzerStatus.Enabled : BuzzerStatus.Disabled);

    const [usersBuzzedIn, setUsersBuzzedIn] = useState<RedisUser[]>([]);

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

    const BuzzerListenerCallback = useCallback((data: any) => {
        const users = data.users as RedisUser[];

        // Alert host that team buzzed in
        let currentUsersBuzzedIn = usersBuzzedIn;

        users.map((user) => {
            if (
                currentUsersBuzzedIn.some((currentUserBuzzedIn) => currentUserBuzzedIn.user_data.name === user.user_data.name)
                || buzzer.user.name === user.user_data.name
            ) {
                // Already showed user buzzed in
                // Ignore this user
                return;
            }

            currentUsersBuzzedIn.push(user);

            notificationApi.warning({
                key: user.user_data.team.id,
                placement: "bottomRight",
                message: `${user.user_data.team.team_name}`,
                description: `${user.user_data.name} buzzed in ${user.order}`,
                duration: 5,
                closeIcon: false
            });
        });

        setUsersBuzzedIn(currentUsersBuzzedIn);
    },[
        usersBuzzedIn.length
    ]);

    const BuzzableListenerCallback = (data: any) => {
        if (data.buzzable) {
            setBuzzerStatus(BuzzerStatus.Enabled);
        } else {
            setBuzzerStatus(BuzzerStatus.Disabled);
            setUsersBuzzedIn([]);
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
            { messageContextHolder }
            { notificationContextHolder }
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
