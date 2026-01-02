import { NetEvent, NetEvents } from "./interfaces/net";
import { NetMessages, QueuedMessage } from "./messages";
import { NetElement } from "./net";

export class Client extends NetElement {

    private _socket: WebSocket | null = null;

    private server: NetMessages;
    private client: NetMessages;

    public events: NetEvent[] = [];
    public messages: QueuedMessage[] = [];

    public get socket() { 
        if (!this._socket) {
            throw new Error("Socket not initialized");
        }
        return this._socket; 
    }

    private _connected: boolean = false;

    public get connected() { return this._connected; }

    private connectionDelay: number = 1000;

    constructor(host: string, port: number, server: NetMessages, client: NetMessages) {
        super(host, port);
        this.server = server;
        this.client = client;
        this.connect();
    }

    private connect() {

        console.log("Attempting to connect to websocket");

        try {
            this._socket = new WebSocket(this.connectionString);

            this.socket.onmessage = async (e) => {
                // @ts-ignore
                this.messages.push({message: this.server.read(await e.data.arrayBuffer())});
            } 

            this.socket.onopen = () => {
                this._connected = true;
                this.events.push({type: NetEvents.Connected});
            }

            this.socket.onclose = () => {
                console.log("Disconnected from server");
                this._connected = false;
                setTimeout(() => this.connect(), this.connectionDelay);
            }

            // this.socket.onerror = (e) => {
            //     console.error(`Websocket error: `, e);
            // }
        } catch (e) {
            console.log("Failed to connect to socket");
            setTimeout(() => this.connect(), this.connectionDelay);
        }
    }
}