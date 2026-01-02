import { INetAddress, NetEvents } from "./interfaces/net";
import { IClient } from "./interfaces/client";
import { NetElement } from "./net";
import { INetMessages } from "./interfaces/messages";

export class Client extends NetElement implements IClient {

    private _socket: WebSocket | null = null;

    public get socket() { 
        if (!this._socket) {
            throw new Error("Socket not initialized");
        }
        return this._socket; 
    }

    private _connected: boolean = false;

    public get connected() { return this._connected; }

    private connectionDelay: number = 1000;

    constructor(address: INetAddress, client: INetMessages, server: INetMessages) {
        super(address, client, server);
        this.connect();
    }

    private connect() {

        console.log("Attempting to connect to websocket");

        try {
            this._socket = new WebSocket(this.connectionString);

            this.socket.onmessage = async (e) => {
                this.messages.push({message: this.serverMessages.read(await e.data.arrayBuffer())});
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