import WebSocket from "ws";
import { INetMessages, QueuedMessage } from "./messages";

export enum NetEvents {
    Connected,
    Disconnected,
};

export interface NetEvent {
    type: NetEvents;
    socket?: WebSocket;
}

export interface INetAddress {
    host: string;
    port: number;
}

export interface INetElement {
    address: INetAddress;
    connectionString: string;
    clientMessages: INetMessages;
    serverMessages: INetMessages;
    flushEvents(cb: (event: NetEvent) => void): void;
    flushMessages(cb: (message: QueuedMessage) => void): void;
}