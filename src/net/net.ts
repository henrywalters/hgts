import { NetEvent } from "./interfaces/net";
import { QueuedMessage } from "./messages";

export abstract class NetElement {
    private _host: string;
    private _port: number;

    public get host() { return this._host; }
    public get port() { return this._port; }

    abstract events: NetEvent[];
    abstract messages: QueuedMessage[];

    public get connectionString() {
        return `ws://${this.host}:${this.port}`;
    }

    constructor(host: string = "localhost", port: number = 4200) {
        this._host = host;
        this._port = port;
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