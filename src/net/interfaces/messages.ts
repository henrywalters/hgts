import { IParameterizable } from "../../core/reflection";
import { WebSocket } from 'ws';

export interface INetMessage extends IParameterizable {
    type: number;
}

export type NetMessageCtr<T extends INetMessage> = {
    new (): T;
    name: string;
}

export interface QueuedMessage<T extends INetMessage = any> {
    socket?: WebSocket;
    message: T;
}

export interface BinaryField {
    length: number | ((value: any) => number);
    write(view: DataView, offset: number, value: any): void;
    read(view: DataView, offset: number): any;
}

export type NetMessageConfig = Map<number, NetMessageCtr<any>>;

export interface INetMessages {
    config: NetMessageConfig;

    write<T extends INetMessage>(data: T): ArrayBuffer;
    read<T extends INetMessage>(data: ArrayBuffer): T;
}