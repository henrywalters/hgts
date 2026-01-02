
export enum PongStates {
    Waiting,
    Serving,
    Receiving,
    Playing,
    GameOver,
}

export enum PongMenuStates {
    Disconnected,
    Connected,
    Waiting,
}

interface IPongState {
    state: PongStates;
    gameOverMessage?: string;
    playerId: number;
    opponentId: number;
    isPlayerOne: boolean;
    scores: number[];
}

export const PongState: IPongState = {
    state: PongStates.Waiting,
    playerId: -1,
    opponentId: -1,
    isPlayerOne: false,
    scores: [0, 0]
}

interface IPongMenuState {
    state: PongMenuStates;
}

export const PongMenuState: IPongMenuState = {
    state: PongMenuStates.Disconnected,
}