import { Color, Vector3 } from "three";
import { Param, Types } from "../../core/reflection";
import { NetMessage, NetMessages } from "../../net/messages";

export enum ServerMessageTypes {
    Connected,
    PlayerJoined,
    PlayerLeft,
    Moved,
}

export enum ClientMessageTypes {
    Connect,
    Move,
}

export class PlayerConnected extends NetMessage {

    type = ServerMessageTypes.Connected;

    @Param({type: Types.Int})
    serverId: number = 0;

    @Param({type: Types.Color})
    color: Color = new Color();
}

export class PlayerJoined extends PlayerConnected {
    type = ServerMessageTypes.PlayerJoined;

    @Param({type: Types.Vector3})
    position: Vector3 = new Vector3();
}

export class PlayerLeft extends NetMessage {
    type = ServerMessageTypes.PlayerLeft;
    
    @Param({type: Types.Int})
    serverId: number = 0;
}

export class PlayerConnect extends NetMessage {
    type = ClientMessageTypes.Connect;
}

export class PlayerMove extends NetMessage {
    type = ClientMessageTypes.Move;

    @Param({type: Types.Vector3})
    position: Vector3 = new Vector3();
}

export class PlayerMoved extends NetMessage {
    type = ServerMessageTypes.Moved;

    @Param({type: Types.Int})
    serverId: number = 0;

    @Param({type: Types.Vector3})
    position: Vector3 = new Vector3();
}

export const ServerMessages = new NetMessages([PlayerConnected, PlayerMoved, PlayerJoined, PlayerLeft]);
export const ClientMessages = new NetMessages([PlayerConnect, PlayerMove]);