import JoinGame from "@/Pages/Game/JoinGame";
import JoinRoom from "@/Pages/Game/JoinRoom";
import {Game} from "@/types/game";

export default function GameLogin({ game } : { game: Game }) {
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
