import { useForm } from '@inertiajs/react';
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import {FormEventHandler} from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import {Game} from "@/types/game";

export default function JoinRoom({ game } : { game: Game } ) {
    const { data, setData, post, processing, errors, reset } = useForm({
        gameId: game.id,
        team: '',
        name: '',
        remember: false,
    });

    const JoinRoom: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('join-room'));
    };

    return (
        <>
            <form onSubmit={JoinRoom}>
                {game?.id && game?.hasTeams &&
                    <div>
                        <InputLabel htmlFor="email" value="Room"/>

                        <TextInput
                            id="team"
                            type="text"
                            name="team"
                            value={data.team}
                            className="mt-1 block w-full"
                            autoComplete="room"
                            isFocused={true}
                            onChange={(e) => setData('team', e.target.value)}
                        />

                        <InputError message={errors.name} className="mt-2"/>
                    </div>
                }

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Name"/>

                    <TextInput
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                    />

                    <InputError message={errors.name} className="mt-2"/>
                </div>

                <div className="flex items-center justify-end mt-4">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Join Room
                    </PrimaryButton>
                </div>
            </form>
        </>
);
}
