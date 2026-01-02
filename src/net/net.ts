import { INetMessages, QueuedMessage } from "./interfaces/messages";
import { INetElement, INetAddress, NetEvent } from "./interfaces/net";

export abstract class NetElement implements INetElement {
    private _address: INetAddress;

    private _clientMessages: INetMessages;
    private _serverMessages: INetMessages;

    public get address() { return this._address; }

    public get clientMessages() {
        return this._clientMessages;
    }

    public get serverMessages() {
        return this._serverMessages;
    }

    protected events: NetEvent[] = [];
    protected messages: QueuedMessage[] = [];

    public get connectionString() {
        return `ws://${this.address.host}:${this.address.port}`;
    }

    constructor(address: INetAddress, client: INetMessages, server: INetMessages) {
        this._address = address;
        this._clientMessages = client;
        this._serverMessages = server;
    }

    public flushEvents(cb: (event: NetEvent) => void): void {
        while (this.events.length > 0) {
            const front = this.events.shift()!;
            cb(front);
        }
    }

    public flushMessages(cb: (message: QueuedMessage) => void): void {
        while (this.messages.length > 0) {
            const front = this.messages.shift()!;
            cb(front);
        }
    }
}