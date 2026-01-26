import { INetAddress, NetEvents } from "./interfaces/net";
import { IClient } from "./interfaces/client";
import { NetElement } from "./net";
import { INetMessage, INetMessages } from "./interfaces/messages";
import { NetMessage } from "./messages";

export class Client extends NetElement implements IClient {

    private _socket: WebSocket | null = null;

    public get socket() { 
        if (!this._socket) {
            throw new Error("Socket not initialized");
        }
        return this._socket; 
    }

    private _connected: boolean = false;

    private isNode = false;

    public get connected() { return this._connected; }

    private connectionDelay: number = 1000;

    public onMessage: (msg: INetMessage) => void = (_) => {};

    constructor(address: INetAddress, client: INetMessages, server: INetMessages, isNode = false) {
        super(address, client, server);
        this.isNode = isNode;
        this.connect();
    }

    private connect() {

        console.log(`Attempting to connect to server: ${this.address.host}:${this.address.port}`);

        try {
            this._socket = new WebSocket(this.connectionString);

            this.socket.onmessage = async (e) => {
                const buffer = await e.data.arrayBuffer();
                const message = this.serverMessages.read(buffer);
                this.onMessage(message);
                this.messages.push({
                    message,
                });
            } 

            this.socket.onopen = () => {
                console.log(`Connected to server: ${this.address.host}:${this.address.port}`);
                this._connected = true;
                this.events.push({type: NetEvents.Connected});
            }

            this.socket.onclose = () => {
                console.log(`Disconnected from server: ${this.address.host}:${this.address.port}`);
                this._connected = false;
                setTimeout(() => this.connect(), this.connectionDelay);
            }

            this.socket.onerror = (e) => {
                if (this.isNode) {
                    setTimeout(() => this.connect(), this.connectionDelay);
                }
            }
        } catch (e) {
            console.log("Failed to connect to socket");
            setTimeout(() => this.connect(), this.connectionDelay);
        }
    }

    send(msg: NetMessage): void {
        this.socket.send(this.clientMessages.write(msg));
    }
}