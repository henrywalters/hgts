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

        this._wss = new WebSocketServer({host: this.address.host, port: this.address.port});

        console.log(`Websocket Server running on port: ${this.address.port}`);

        this.wss.on('connection', (ws) => {
            console.log(`Client Connected to port ${this.address.port}`);
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
                console.log(`Client disconnected from port ${this.address.port}`);
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