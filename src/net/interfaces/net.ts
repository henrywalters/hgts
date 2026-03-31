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

export interface INetSocketAddress {
    host: string;
    port: number;
}

export interface INetAddress {
    secure: boolean;
    socketAddress?: INetSocketAddress;
    url?: string;
}

export function getNetAddressString(addr: INetAddress) {
    const protocol = addr.secure ? 'wss' : 'ws';
    if (addr.url) {
        return `${protocol}://${addr.url}`;
    } else if (addr.socketAddress) {
        return `${protocol}://${addr.socketAddress.host}:${addr.socketAddress.port}`;
    } else {
        throw new Error("Socket Address or URL required for net address");
    }
}

export interface INetElement {
    address: INetAddress;
    connectionString: string;
    clientMessages: INetMessages;
    serverMessages: INetMessages;
    flushEvents(cb: (event: NetEvent) => void): void;
    flushMessages(cb: (message: QueuedMessage) => void): void;
    installFilter(types: number[], cb: (msg: QueuedMessage) => void): void;
}