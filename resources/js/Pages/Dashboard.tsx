import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, Link} from '@inertiajs/react';
import { PageProps } from '@/types';
import { Typography } from 'antd';
import PrimaryButton from "@/Components/PrimaryButton";

const { Title } = Typography;

export default function Dashboard({ auth, gameRooms }: PageProps) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            {gameRooms.map((gameRoom) => {
                return (
                    <div className="py-12">
                        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 text-gray-900">
                                    <Title underline={true} level={5}>Room #{gameRoom.id}</Title>
                                    <div>
                                        <p>
                                            <span className="text-gray-600">Code:</span> {gameRoom.code}
                                        </p>
                                        <p>
                                            <span className="text-gray-600">Game:</span> {gameRoom.game}
                                        </p>
                                    </div>
                                    <Link
                                        href={route('game', {
                                            id: gameRoom.id,
                                        })}
                                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <PrimaryButton
                                            className="mt-4 mr-4">
                                            Join Game
                                        </PrimaryButton>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}

                </AuthenticatedLayout>
                );
            }
