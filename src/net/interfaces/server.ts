import { WebSocketServer, WebSocket } from "ws";
import { INetMessage } from "./messages";
import { NetElement } from "../net";

export interface IServer extends NetElement {

    wss: WebSocketServer;
    clients: Set<WebSocket>

    emit(key: number, message: INetMessage, ignore?: WebSocket[]): void;
}