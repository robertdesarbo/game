import { Head } from "@inertiajs/react";
import { GameRoom as GameRoomType } from "@/types/gameRoom";
import { useEffect, useState } from "react";
import { Modal, notification, Drawer, Statistic } from 'antd';
import BuzzerListen from "@/Pages/Game/BuzzerListen";
import { FocusScope } from 'react-aria';
import axios from 'axios';

export default function GameRoom(gameRoom: GameRoomType) {
    const [question, setQuestion] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [teamScore, setTeamScore] = useState({});

    const [activeTeamId, setActiveTeamId] = useState(1);
    const [activeQuestionId, setActiveQuestionId] = useState(2);

    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        gameRoom.teams.map((team) => {
            setTeamScore((previousScore) => ({
                ...previousScore,
                [team.id]: 0
            }));
        });
    }, []);


    const handleKeyDown = (event) => {
        if(event.shiftKey && event.key === 'S') {
            // show teamScore
            console.log('teamScore');
            setIsDrawerOpen(!isDrawerOpen)
        } else if (event.shiftKey && event.key === 'C') {
            // correct answer
            axios.post(route(`game`, {
                id: 1,
                question_id: activeQuestionId,
                team_id: activeTeamId,
                is_correct: true,
                amount: 100,
            })).then(res => {
                const score = res.data.score;

                setTeamScore((previousScore) => ({
                    ...previousScore,
                    [activeTeamId]: score
                }))
            });

            console.log('correct');
        } else if (event.shiftKey && event.key === 'W') {
            // incorrect answer
            axios.post(route(`game`, {
                id: 1,
                question_id: activeQuestionId,
                team_id: activeTeamId,
                is_correct: false,
                amount: 100,
            })).then(res => {
                const score = res.data.score;

                setTeamScore((previousScore) => ({
                    ...previousScore,
                    [activeTeamId]: score
                }))
            });
        }
    }


    const showQuestion = (question: string) => {
        setQuestion(question);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const listenerCallback = (data: any) => {
        const user = data.users[data.users.length - 1];

        api.info({
            placement: "topLeft",
            message: `${user?.name} buzzed in (${user?.teamName})`,
            duration: 0,
        });
    };

    return (
        <FocusScope restoreFocus autoFocus>
            <div tabIndex={-1} onKeyDown={handleKeyDown}>
                <Head title="Game Room"/>
                <BuzzerListen id={gameRoom.id} listenerCallback={listenerCallback}/>
                {contextHolder}
                <div className="h-screen w-screen px-2 grid grid-cols-6 gap-4 bg-black py-2 text-center">
                    {gameRoom.metaData.categories.map((category) => {
                        return (
                            <div key={category.name} className="grid grid-cols-1 gap-4 grid-rows-6">
                                <div
                                    className="p-1 text-3xl font-bold bg-[#020978] text-white flex items-center justify-center">
                                    {category.name}
                                </div>
                                {category.questions.map((question) => {
                                    return (
                                        <div
                                            onClick={() => {
                                                showQuestion(question.question)
                                            }}
                                            key={question.question}
                                            className="cursor-pointer text-6xl font-semibold bg-[#020978] text-[#D7A14A] flex items-center justify-center">
                                            { true && question.order * category.multiplier * 100 }
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
                <Modal
                    className="top-0 w-full h-full p-0 m-0"
                    classNames={{
                        body: 'flex items-center justify-center h-full bg-[#020978] text-white',
                    }}
                    width="100%"
                    open={isModalOpen}
                    onOk={handleOk}
                    maskClosable={false}
                    centered={true}
                    onCancel={handleCancel}
                    closeIcon={null}
                    footer={null}
                    styles={{'content': {padding: '0', margin: '0', height: '100%', borderRadius: 0}}}
                >
                    <div className="text-7xl">
                        <p>{question}</p>
                    </div>
                </Modal>
                <Drawer
                    title="Scores"
                    placement="bottom" open={isDrawerOpen}
                    height={175}
                    closeIcon={false}
                >
                    <div className="w-full grid grid-flow-col auto-cols-12 text-center">
                        {gameRoom.teams.map((team) => {
                            return (
                                <Statistic key={team?.id} title={team?.team_name} prefix="$" value={teamScore[team?.id]} />
                            );
                        })}
                    </div>
                </Drawer>
            </div>
        </FocusScope>
    );
}
