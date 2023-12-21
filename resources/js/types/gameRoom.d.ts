interface Question {
    question: string;
    order: number;
    isDailyDouble?: boolean;
}

interface Categories {
    categories: Category[]
}

interface Category {
    name: string;
    multiplier: number;
    round: number,
    questions: Question[];
}

interface Team {
    id: number;
    team_name: string;
}

export interface GameRoom {
    id: string;
    game: string;
    metaData: Categories;
    teams: Team[]
}

export interface Buzzer {
    gameRoom: GameRoom;
    teamName: string;
    user: string;
}
