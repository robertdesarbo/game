export interface Options {
    label: string;
    value: string
}

export interface JoinGame {
    id: number;
    teams: Options[]
    hasTeams: boolean
}
