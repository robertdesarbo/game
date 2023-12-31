import { Head } from "@inertiajs/react";
import {GameRoom as GameRoomType, Question, RedisScore, RedisUser} from "@/types/gameRoom";
import {useCallback, useEffect, useState} from "react";
import { Modal, notification, Drawer, Statistic } from 'antd';
import BuzzerListen from "@/Pages/Game/BuzzerListen";
import { FocusScope } from 'react-aria';

export default function GameRoom(gameRoom: GameRoomType) {
    const [questionsAnswered, setQuestionsAnswered] = useState<string[]>([]);

    const [question, setQuestion] = useState<Question>();
    const [showAnswer, setShowAnswer] = useState(false);
    const [activeTeamId, setActiveTeamId] = useState<number|null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [usersBuzzedIn, setUsersBuzzedIn] = useState<RedisUser[]>([]);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [teamScore, setTeamScore] = useState<RedisScore|null>(null);

    const [notificationApi, contextHolder] = notification.useNotification({stack: false});

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

        // Close buzzing
        window.axios.post(route(`buzzable`, {
            id: gameRoom.id,
            is_buzzable: false,
        }));
    }, []);

    useEffect(() => {
        setActiveTeamId(null);
    }, [questionsAnswered]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLImageElement>) => {
        if(event.shiftKey && event.key === 'S') {
            // show teamScore
            setIsDrawerOpen(!isDrawerOpen)
        } else if (event.shiftKey && event.key === 'C') {
            if(typeof question?.question === 'undefined' || activeTeamId === null) {
                console.log('ignore');
                return;
            }

            // correct answer
            window.axios.post(route(`answer`, {
                id: gameRoom.id,
                question: question?.question,
                team_id: activeTeamId,
                is_correct: true,
                amount: question.order * 100,
            })).then(res => {
                const response = res.data;

                setTeamScore((previousScore) => ({
                    ...previousScore,
                    [activeTeamId]: response.score
                }));

                setShowAnswer(true);
                setQuestionsAnswered(response.questionsAnswered);

                // Close all notifications
                notificationApi.destroy();
            });

        } else if (event.shiftKey && event.key === 'W') {
            if(typeof question?.question === 'undefined' || activeTeamId === null) {
                console.log('ignore');
                return;
            }

            // incorrect answer
            window.axios.post(route(`answer`, {
                id: gameRoom.id,
                question: question?.question,
                team_id: activeTeamId,
                is_correct: false,
                amount: question.order * 100,
            })).then(res => {
                const response = res.data;

                setTeamScore((previousScore) => ({
                    ...previousScore,
                    [activeTeamId]: response.score
                }));

                // Close this teams notification
                notificationApi.destroy(activeTeamId);

                // Set next team as active
                setUsersBuzzedIn((previousUsersBuzzedIn) => {
                    previousUsersBuzzedIn.shift();

                    if (previousUsersBuzzedIn.length > 0) {
                        const fastest_user = previousUsersBuzzedIn.reduce(function(prev, curr) {
                            return prev.milliseconds_to_buzz_in < curr.milliseconds_to_buzz_in ? prev : curr;
                        });

                        setActiveTeamId(fastest_user.user_data.team.id);
                    } else {
                        setActiveTeamId(null);
                    }

                    return previousUsersBuzzedIn;
                });
            });
        } else if (event.shiftKey && event.key === 'U') {
            // incorrect answer
            window.axios.post(route(`answerWithoutScore`, {
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
        setShowAnswer(false);
        setQuestion(question);
        setUsersBuzzedIn([]);
        setIsModalOpen(true);

        // Open up buzzing
        window.axios.post(route(`buzzable`, {
            id: gameRoom.id,
            is_buzzable: true,
        }));
    };

    const handleCancel = () => {
        // Close buzzing
        window.axios.post(route(`buzzable`, {
            id: gameRoom.id,
            is_buzzable: false,
        }));

        notificationApi.destroy();

        setQuestion(undefined);
        setActiveTeamId(null);
        setShowAnswer(false);
        setIsModalOpen(false);
    };

    const listenerCallback = useCallback((data: any) => {
        const users = data.users as RedisUser[];

        const fastest_user = users.reduce(function(prev, curr) {
            return prev.milliseconds_to_buzz_in < curr.milliseconds_to_buzz_in ? prev : curr;
        });

        setActiveTeamId(fastest_user.user_data.team.id);

        // Alert host that team buzzed in
        let currentUsersBuzzedIn = usersBuzzedIn;

        users.map((user) => {
            if (currentUsersBuzzedIn.some((currentUserBuzzedIn) => currentUserBuzzedIn.user_data.team.id === user.user_data.team.id)) {
                // Team buzzed in
                return;
            }

            currentUsersBuzzedIn.push(user);
            notificationApi.info({
                key: user.user_data.team.id,
                placement: "topLeft",
                message: `${user.teamOrder} - ${user.user_data.name} buzzed in (${user.user_data.team.team_name})`,
                duration: 0,
                closeIcon: false
            });
        });

        setUsersBuzzedIn(currentUsersBuzzedIn);
    },[
        usersBuzzedIn.length
    ]);

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
                    placement="bottom"
                    open={isDrawerOpen}
                    height={100}
                    closeIcon={false}
                    mask={false}
                >
                    <div className="w-full grid grid-flow-col auto-cols-12 text-center">
                        {gameRoom.teams.map((team) => {
                            return (
                                <Statistic
                                    key={team?.team_name}
                                    title={team?.team_name}
                                    prefix="$"
                                    value={teamScore !== null ? teamScore[team?.id] : 0}
                                />
                            );
                        })}
                    </div>
                </Drawer>
            </div>
        </FocusScope>
    );
}
