import { WebSocketServer, WebSocket } from 'ws';
import { NetMessage, NetMessages } from './messages';
import { INetAddress, NetEvent, NetEvents } from './interfaces/net';
import { NetElement } from './net';
import { IServer } from './interfaces/server';
import { INetMessage, INetMessages } from './interfaces/messages';

export class Server extends NetElement implements IServer {
    private _wss: WebSocketServer;
    private _clients: Set<WebSocket> = new Set<WebSocket>();

    public get wss() { return this._wss; }
    public get clients() { return this._clients; }

    public onMessage: (msg: INetMessage) => void = (_) => {};

    constructor(address: INetAddress, client: INetMessages, server: INetMessages) {
        super(address, client, server);

        if (!this.address.socketAddress) {
            throw new Error("Socket Address required for Server");
        }

        this._wss = new WebSocketServer({host: this.address.socketAddress.host, port: this.address.socketAddress.port});

        console.log(`Websocket Server running on  ${this.address.socketAddress.host}:${this.address.socketAddress.port}`);

        this.wss.on('connection', (ws) => {
            if (!this.address.socketAddress) {
                throw new Error("Socket Address required for Server");
            }
            console.log(`Client Connected to port ${this.address.socketAddress.port}`);
            this.clients.add(ws);
            
            this.onEvent({type: NetEvents.Connected});

            this.events.push({
                type: NetEvents.Connected,
                socket: ws,
            });

            ws.on('message', (data: Buffer) => {
                const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
                const message = this.clientMessages.read(buffer);
                this.onMessage(message);
                this.messages.push({
                    socket: ws, 
                    message,
                    buffer: data,
                });
            });

            ws.on('close', () => {
                if (!this.address.socketAddress) {
                    throw new Error("Socket Address required for Server");
                }
                console.log(`Client disconnected from port ${this.address.socketAddress.port}`);
                this.onEvent({type: NetEvents.Disconnected});
                this.events.push({
                    type: NetEvents.Disconnected,
                    socket: ws,
                });
                this.clients.delete(ws);
            });
        });
    }

    emit(message: INetMessage, ignore: WebSocket[] = []) {
        for (const client of this.clients) {
            if (ignore.indexOf(client) !== -1) continue;
            client.send(this.serverMessages.write(message));
        }
    }
}