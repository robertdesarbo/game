import JoinGame from "@/Pages/Game/JoinGame";
import JoinTeam from "@/Pages/Game/JoinTeam";
import {Game} from "@/types/game";
import {Head} from "@inertiajs/react";
import {GameRoom} from "@/types/gameRoom";

export default function GameLogin(gameRoom: GameRoom) {
    return (
        <>
            <Head title="Game Room"/>
            <div className="grid grid-cols-1 hover:grid-cols-6">
               Beep
            </div>
        </>
    );
}
