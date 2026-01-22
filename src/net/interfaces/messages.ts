import { WebSocket } from 'ws';
import { Ctr, Field, Types } from '../../core/reflection';

export interface INetMessage {
    type: number;
}

export type NetMessageCtr<T extends INetMessage> = {
    new (): T;
    name: string;
}

export interface QueuedMessage<T extends INetMessage = any> {
    socket?: WebSocket;
    message: T;
    buffer?: Buffer;
}

export interface BinaryField {
    length: number | ((field: Field, value: any) => number);
    write(field: Field, view: DataView, offset: number, value: any): void;
    read(field: Field, view: DataView, offset: number): any;
}

export type NetMessageConfig = Map<number, NetMessageCtr<any>>;

export interface INetMessages {
    config: NetMessageConfig;

    write<T extends INetMessage>(data: T): ArrayBuffer;
    read<T extends INetMessage>(data: ArrayBuffer): T;
}