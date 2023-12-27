import {Link, Head} from '@inertiajs/react';
import { PageProps } from '@/types';
import GuestLayout from '@/Layouts/GuestLayout';
import GameLogin from "@/Pages/Game/GameLogin";
import {JoinGame as JoinGameType} from "@/types/game";
import {UserGameRoom} from "@/types/gameRoom";
import PrimaryButton from "@/Components/PrimaryButton";
import GuestInGameLayout from "@/Layouts/GuestInGameLayout";

export default function Welcome({ auth, laravelVersion, phpVersion, userGameRoom, game }: PageProps<{ laravelVersion: string, phpVersion: string, userGameRoom: UserGameRoom, game: JoinGameType }>) {
    return (
        <>
            <Head title="Welcome" />
            {userGameRoom?.joined_room && userGameRoom?.game_room_id ? (
                <GuestInGameLayout>
                    <div>
                        <b>{userGameRoom?.name}</b> is currently on team <b>{userGameRoom?.team.team_name}</b>.
                    </div>
                    <Link
                        href={route('buzzer', {
                            id: userGameRoom?.game_room_id,
                        })}
                    >
                        <PrimaryButton
                            className="mt-4 mr-4">
                            Rejoin Game
                        </PrimaryButton>
                    </Link>
                    <Link
                        href={route('leave', {
                            id: userGameRoom?.game_room_id,
                        })}
                        method="post"
                        as="button"
                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Leave
                    </Link>
                </GuestInGameLayout>
            ) : (
                <div
                    className="relative sm:flex sm:justify-center sm:items-center min-h-screen bg-dots-darker bg-center bg-gray-100 dark:bg-dots-lighter dark:bg-gray-900 selection:bg-red-500 selection:text-white">
                    <div className="sm:fixed sm:top-0 sm:right-0 p-6 text-end">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                                >
                                    Log in
                                </Link>

                                <Link
                                    href={route('register')}
                                    className="ms-4 font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="max-w-full mx-auto">
                        <GuestLayout>
                            <GameLogin game={game}/>
                        </GuestLayout>
                    </div>
                </div>
            )}

        </>
    );
}
