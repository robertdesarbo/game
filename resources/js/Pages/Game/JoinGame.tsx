import { useForm } from '@inertiajs/react';
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import {FormEventHandler} from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import {Game} from "@/types/game";

export default function JoinGame({ game } : { game: Game }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        gameCode: '',
        remember: false,
    });

    const joinGame: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('join-game'));
    };

    return (
        <>
            <form onSubmit={joinGame}>
                <div>
                    <InputLabel htmlFor="email" value="Game Code"/>

                    <TextInput
                        id="game-code"
                        type="text"
                        name="game-code"
                        value={data.gameCode}
                        className="mt-1 block w-full"
                        autoComplete="game-code"
                        isFocused={true}
                        readOnly={typeof game?.id !== "undefined"}
                        onChange={(e) => setData('gameCode', e.target.value)}
                    />

                    <InputError message={errors.gameCode} className="mt-2"/>
                </div>

                {typeof game?.id === "undefined" &&
                    <div className="flex items-center justify-end mt-4">
                        <PrimaryButton className="ms-4" disabled={processing}>
                            Join Game
                        </PrimaryButton>
                    </div>
                }
            </form>
        </>
    );
}