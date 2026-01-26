import { NetMessage } from "../messages";
import { INetElement, NetEvent } from "./net";

export interface IClient extends INetElement {
    connected: boolean;
    socket: WebSocket;

    send(msg: NetMessage): void;
}