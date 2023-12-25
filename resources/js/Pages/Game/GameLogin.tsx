import JoinGame from "@/Pages/Game/JoinGame";
import JoinRoom from "@/Pages/Game/JoinRoom";
import {JoinGame as JoinGameType} from "@/types/game";

export default function GameLogin({ game } : { game: JoinGameType }) {
    return (
        <>
            <JoinGame game={game} />
            {game?.id &&
                <div className="mt-4">
                    <JoinRoom game={game} />
                </div>
            }
        </>
    );
}
