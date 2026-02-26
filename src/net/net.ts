import { INetMessage, INetMessages, QueuedMessage } from "./interfaces/messages";
import { INetElement, INetAddress, NetEvent } from "./interfaces/net";

export interface NetMessageFilter {
    types: Set<number>;
    callback: (message: QueuedMessage) => void;
}

export abstract class NetElement implements INetElement {
    private _address: INetAddress;

    private _clientMessages: INetMessages;
    private _serverMessages: INetMessages;

    private filters: NetMessageFilter[] = [];

    public get address() { return this._address; }

    public get clientMessages() {
        return this._clientMessages;
    }

    public get serverMessages() {
        return this._serverMessages;
    }

    protected events: NetEvent[] = [];
    protected messages: QueuedMessage[] = [];

    public onMessage: (msg: INetMessage) => void = (_) => {};
    public onEvent: (event: NetEvent) => void = (_) => {};

    public get connectionString() {
        return `ws://${this.address.host}:${this.address.port}`;
    }

    constructor(address: INetAddress, client: INetMessages, server: INetMessages) {
        this._address = address;
        this._clientMessages = client;
        this._serverMessages = server;
    }

    public installFilter(types: number[], cb: (msg: QueuedMessage) => void) {
        this.filters.push({
            types: new Set(types),
            callback: cb,
        });
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

            for (const filter of this.filters) {
                if (filter.types.has(front.message.type)) {
                    filter.callback(front);
                }
            }

            cb(front);
        }
    }
}