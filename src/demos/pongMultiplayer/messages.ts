import { Vector2 } from "three";
import { Param, Types } from "../../core/reflection";
import { NetMessage, NetMessages } from "../../net/messages";

export enum PongEvents {
    JoinGameRequest,
    JoinGameReply,
    PlayerReady,
    PlayerInput,
    GameReady,
    GameStart,
    GameUpdate,
    GameOver,
}

export class JoinGameRequest extends NetMessage {
    type = PongEvents.JoinGameRequest;
}

export class JoinGameReply extends NetMessage {
    type = PongEvents.JoinGameReply;

    @Param({type: Types.Int})
    playerId: number = -1;

    @Param({type: Types.Int})
    opponentId: number = -1;

    @Param({type: Types.Boolean})
    isPlayerOne: boolean = false;
}

export class PlayerReady extends NetMessage {
    type = PongEvents.PlayerReady;
}

export class PlayerInput extends NetMessage {
    type = PongEvents.PlayerInput;

    @Param({type: Types.Boolean})
    up: boolean = false;

    @Param({type: Types.Boolean})
    down: boolean = false;

    @Param({type: Types.Boolean})
    launch: boolean = false;
}

export class GameReady extends NetMessage {
    type = PongEvents.GameReady;

    @Param({type: Types.Int})
    player1Score: number = 0;

    @Param({type: Types.Int})
    player2Score: number = 0;

    @Param({type: Types.Int})
    servingPlayer: number = 0;
}

export class GameStart extends NetMessage {
    type = PongEvents.GameStart;
}

export class GameUpdate extends NetMessage {
    type = PongEvents.GameUpdate;

    @Param({type: Types.Vector2})
    ballPos: Vector2 = new Vector2();

    @Param({type: Types.Float})
    speed = 0;

    @Param({type: Types.Float})
    player1Y: number = 0;

    @Param({type: Types.Float})
    player2Y: number = 0;

    @Param({type: Types.Int})
    tick: number = 0;
}

export class GameOver extends NetMessage {
    type = PongEvents.GameOver;


    @Param({type: Types.String})
    message: string = "";
}

export const ServerMessages = new NetMessages([JoinGameReply, GameReady, GameStart, GameUpdate, GameOver]);
export const ClientMessages = new NetMessages([JoinGameRequest, PlayerReady, PlayerInput]);