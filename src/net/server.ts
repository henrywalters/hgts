import { WebSocketServer, WebSocket } from 'ws';
import { NetMessage, NetMessages, QueuedMessage } from './messages';
import { NetEvent, NetEvents } from './interfaces/net';
import { NetElement } from './net';

export class Server extends NetElement {
    private _wss: WebSocketServer;
    private _clients: Set<WebSocket> = new Set<WebSocket>();

    private server: NetMessages;
    private client: NetMessages;

    public events: NetEvent[] = [];
    public messages: QueuedMessage[] = [];

    public get wss() { return this._wss; }
    public get clients() { return this._clients; }

    constructor(host: string, port: number, server: NetMessages, client: NetMessages) {
        super(host, port);
        this.server = server;
        this.client = client;

        this._wss = new WebSocketServer({host: this.host, port: this.port});

        console.log(`Websocket Server running on port: ${port}`);

        this.wss.on('connection', (ws) => {
            console.log("Client Connected");
            this.clients.add(ws);

            this.events.push({
                type: NetEvents.Connected,
                socket: ws,
            });

            ws.on('message', (data: Buffer) => {
                const array = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
                this.messages.push({
                    socket: ws, message: this.client.read(array)
                });
            });

            ws.on('close', () => {
                console.log(`Client disconnected`);
                this.events.push({
                    type: NetEvents.Disconnected,
                    socket: ws,
                });
                this.clients.delete(ws);
            });
        });
    }

    emit(key: number, message: NetMessage, ignore: WebSocket[] = []) {
        for (const client of this.clients) {
            if (ignore.indexOf(client) !== -1) continue;
            client.send(this.server.write(message));
        }
    }
}