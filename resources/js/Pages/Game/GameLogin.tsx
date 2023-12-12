import JoinGame from "@/Pages/Game/JoinGame";
import JoinTeam from "@/Pages/Game/JoinTeam";
import {Game} from "@/types/game";

export default function GameLogin({ game } : { game: Game }) {
    return (
        <>
            <JoinGame game={game} />
            {game?.id &&
                <div className="mt-4">
                    <JoinTeam game={game} />
                </div>
            }
        </>
    );
}
