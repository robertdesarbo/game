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

interface Score {
    team_id: number;
    score: number;
}

export interface GameRoom {
    id: string;
    game: string;
    code: string;
    metaData: Categories;
    teams: Team[];
    scores: Score[];
    questionsAnswered: string [];
}

export interface Question {
    question: string;
    answer: string;
}

export interface UserGameRoom {
    joined_room: boolean;
    game_room_id: string;
    team_name: string;
    name: string;
}

export interface RedisUser {
    [key: string]: User
}

export interface RedisScore {
    [key: string]: number
}

export interface User {
    name: string;
    team: Team;
}

export interface Buzzer {
    gameRoom: GameRoom;
    user: User;
    buzzable: boolean;
}
