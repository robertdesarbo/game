interface Question {
    question: string;
    order: number;
    isDailyDouble?: boolean;
}

interface Category {
    title: string;
    multiplier: number;
    round: number,
    questions: Question[];
}

export interface GameRoom {
    game: string;
    metaData: Category[];
    teams: string
}

export interface Buzzer {
    gameRoom: string;
}
