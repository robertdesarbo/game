import {Head} from "@inertiajs/react";
import {GameRoom} from "@/types/gameRoom";
import {useState} from "react";
import { Modal } from 'antd';

export default function GameLogin(gameRoom: GameRoom) {
    const [question, setQuestion] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showQuestion = (question) => {
        setQuestion(question);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Head title="Game Room"/>
            <div className="grid grid-cols-6 gap-4 bg-black py-2">
                   {gameRoom.metaData.categories.map((category) => {
                       return (
                           <div key={category.name} className="grid grid-cols-1 gap-4 grid-rows-6">
                               <div className="p-4 text-3xl font-bold bg-[#020978] text-white flex items-center justify-center">
                                   {category.name}
                               </div>
                               {category.questions.map((question) => {
                                   return (
                                       <div
                                           onClick={() => {showQuestion(question.question)}}
                                           key={question.question}
                                           className="cursor-pointer p-4 text-7xl font-semibold bg-[#020978] text-[#D7A14A] flex items-center justify-center">
                                           ${question.order}00
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
        </>
    );
}
