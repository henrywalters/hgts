import { INetElement, NetEvent } from "./net";

export interface IClient extends INetElement {
    connected: boolean;
    socket: WebSocket;
}