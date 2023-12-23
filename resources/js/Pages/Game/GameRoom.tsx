import { Head } from "@inertiajs/react";
import {GameRoom as GameRoomType, Question} from "@/types/gameRoom";
import { useEffect, useState } from "react";
import { Modal, notification, Drawer, Statistic } from 'antd';
import BuzzerListen from "@/Pages/Game/BuzzerListen";
import { FocusScope } from 'react-aria';
import axios from 'axios';

export default function GameRoom(gameRoom: GameRoomType) {
    const [questionsAnswered, setQuestionsAnswered] = useState<string[]>([]);
    const [question, setQuestion] = useState<Question>();
    const [showAnswer, setShowAnswer] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [teamScore, setTeamScore] = useState({});

    const [activeTeamId, setActiveTeamId] = useState(null);

    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        // Restore the score
        gameRoom.teams.map((team) => {
            setTeamScore((previousScore) => ({
                ...previousScore,
                [team.id]: gameRoom.scores.find((score) => score.team_id === team.id)?.score ?? 0
            }));
        });

        // Restore questions answered
        setQuestionsAnswered(gameRoom.questionsAnswered);
    }, []);

    useEffect(() => {
        setActiveTeamId(null);
    }, [questionsAnswered]);

    const handleKeyDown = (event) => {
        if(event.shiftKey && event.key === 'S') {
            // show teamScore
            setIsDrawerOpen(!isDrawerOpen)
        } else if (event.shiftKey && event.key === 'C') {
            if(typeof question?.question === 'undefined' || activeTeamId === null) {
                console.log('ignore');
                return;
            }

            // correct answer
            axios.post(route(`answer`, {
                id: gameRoom.id,
                question: question?.question,
                team_id: activeTeamId,
                is_correct: true,
                was_not_answered: false,
                amount: question.order * category.multiplier * 100,
            })).then(res => {
                const response = res.data;

                setTeamScore((previousScore) => ({
                    ...previousScore,
                    [activeTeamId]: response.score
                }));

                setShowAnswer(true);
                setQuestionsAnswered(response.questionsAnswered);
            });

        } else if (event.shiftKey && event.key === 'W') {
            if(typeof question?.question === 'undefined' || activeTeamId === null) {
                console.log('ignore');
                return;
            }

            // incorrect answer
            axios.post(route(`answer`, {
                id: gameRoom.id,
                question: question?.question,
                team_id: activeTeamId,
                is_correct: false,
                was_not_answered: false,
                amount: question.order * 100,
            })).then(res => {
                const response = res.data;

                setTeamScore((previousScore) => ({
                    ...previousScore,
                    [activeTeamId]: response.score
                }));

                setQuestionsAnswered(response.questionsAnswered);
            });
        } else if (event.shiftKey && event.key === 'U') {
            // incorrect answer
            axios.post(route(`answerWithoutScore`, {
                id: gameRoom.id,
                question: question?.question,
            })).then(res => {
                const response = res.data;

                // Show Answer
                setShowAnswer(true);
                setQuestionsAnswered(response.questionsAnswered);
            });
        }
    }

    const showQuestion = (question: Question) => {
        // Show Answer
        setShowAnswer(false);
        setQuestion(question);
        setIsModalOpen(true);

        // Open up buzzing
        axios.post(route(`buzzable`, {
            id: gameRoom.id,
            is_buzzable: true,
        }));
    };

    const handleCancel = () => {
        // Close buzzing
        axios.post(route(`buzzable`, {
            id: gameRoom.id,
            is_buzzable: false,
        }));

        setIsModalOpen(false);
    };

    const listenerCallback = (data: any) => {
        const user = data.users[data.users.length - 1].user;

        setActiveTeamId(user.team.id);

        api.info({
            placement: "topLeft",
            message: `${user.name} buzzed in (${user?.team.team_name})`,
            duration: 0,
        });
    };

    return (
        <FocusScope restoreFocus autoFocus>
            <div tabIndex={-1} onKeyDown={handleKeyDown}>
                <Head title="Game Room"/>
                <BuzzerListen id={gameRoom.id} listenerCallback={listenerCallback}/>
                {contextHolder}
                <div className="px-2 grid grid-cols-6 gap-4 bg-black text-center">
                    {gameRoom.metaData.categories.map((category) => {
                        return (
                            <div key={category.name} className="py-2 h-screen grid gap-4 grid-rows-6">
                                <div
                                    className="p-1 text-xs lg:text-2xl font-bold bg-[#020978] text-white flex items-center justify-center">
                                    {category.name}
                                </div>
                                {category.questions.map((question) => {
                                    return (
                                        <div
                                            onClick={() => {
                                                if(!questionsAnswered?.includes(question.question)) {
                                                    showQuestion(question)
                                                }
                                            }}
                                            key={question.question}
                                            className="cursor-pointer text-xs lg:text-5xl font-semibold bg-[#020978] text-[#D7A14A] flex items-center justify-center">
                                            { !questionsAnswered?.includes(question.question) && question.order * category.multiplier * 100 }
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
                    maskClosable={false}
                    centered={true}
                    onCancel={handleCancel}
                    closeIcon={null}
                    footer={null}
                    styles={{'content': {padding: '0', margin: '0', height: '100%', borderRadius: 0}}}
                >
                    <div className="px-4 text-center text-base lg:text-7xl">
                        {showAnswer ? (
                            <p>{question?.answer}</p>
                        ) : (
                            <p>{question?.question}</p>
                        )}
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
