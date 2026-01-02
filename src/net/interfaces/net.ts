import WebSocket from "ws";

export enum NetEvents {
    Connected,
    Disconnected,
};

export interface NetEvent {
    type: NetEvents;
    socket?: WebSocket;
}