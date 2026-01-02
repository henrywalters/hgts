import { Color, Vector2, Vector3 } from "three";
import { Field, IParameterizable, Types } from "../core/reflection";
import { WebSocket } from "ws";

export abstract class NetMessage implements IParameterizable {

    abstract type: number;

    private _fields: Map<string, Field> = new Map();

    setParam(name: string, field: Field): void {
        this._fields.set(name, field);
    }

    getParams(): Map<string, Field> {
        return this._fields;
    }
}

export interface QueuedMessage<T extends NetMessage = any> {
    socket: WebSocket;
    message: T;
}

export interface BinaryField {
    length: number | ((value: any) => number);
    write(view: DataView, offset: number, value: any): void;
    read(view: DataView, offset: number): any;
}

export const BinaryTypes: {[key: string]: BinaryField} = {
    [Types.Boolean]: {
        length: 1,
        write(view: DataView, offset: number, value: any) {
            view.setUint8(offset, value ? 1 : 0);
        },
        read(view: DataView, offset: number) {
            return view.getUint8(offset) === 1 ? true : false;
        }
    },
    [Types.Float]: {
        length: 4,
        write(view: DataView, offset: number, value: any) {
            view.setFloat32(offset, value);
        },
        read(view: DataView, offset: number) {
            return view.getFloat32(offset);
        }
    },
    [Types.Int]: {
        length: 4,
        write(view: DataView, offset: number, value: any) {
            view.setInt32(offset, value);
        },
        read(view: DataView, offset: number) {
            return view.getInt32(offset);
        }
    },
    [Types.Vector2]: {
        length: 8,
        write(view: DataView, offset: number, value: Vector2) {
            view.setFloat32(offset, value.x);
            view.setFloat32(offset + 4, value.y);
        },
        read(view: DataView, offset: number) {
            return new Vector2(
                view.getFloat32(offset),
                view.getFloat32(offset + 4)
            );
        }
    },
    [Types.Vector3]: {
        length: 12,
        write(view: DataView, offset: number, value: Vector3) {
            view.setFloat32(offset, value.x);
            view.setFloat32(offset + 4, value.y);
            view.setFloat32(offset + 8, value.z);
        },
        read(view: DataView, offset: number) {
            return new Vector3(
                view.getFloat32(offset),
                view.getFloat32(offset + 4),
                view.getFloat32(offset + 8),
            );
        }
    },
    [Types.Color]: {
        length: 12,
        write(view: DataView, offset: number, value: Color) {
            view.setFloat32(offset, value.r);
            view.setFloat32(offset + 4, value.g);
            view.setFloat32(offset + 8, value.b);
        },
        read(view: DataView, offset: number) {
            return new Color(
                view.getFloat32(offset),
                view.getFloat32(offset + 4),
                view.getFloat32(offset + 8),
            );
        }
    },
    [Types.String]: {
        length: (value: string) => {
            return 4 + value.length;
        },
        write(view: DataView, offset: number, value: string) {
            view.setInt32(offset, value.length);
            for (let i = 0; i < value.length; i++) {
                view.setUint8(offset + 4 + i, value[i].charCodeAt(0));
            }
        },
        read(view: DataView, offset: number) {
            const length = view.getInt32(offset);
            let out = "";
            for (let i = 0; i < length; i++) {
                out += String.fromCharCode(view.getUint8(offset + 4 + i));
            }
            return out;
        }
    }
};

export type NetMessageCtr<T extends NetMessage> = {
    new (): T;
    name: string;
}

export class NetMessages {
    private _config: Map<number, NetMessageCtr<any>> = new Map();

    public get config() { return this._config; }

    constructor(configs: NetMessageCtr<any>[]) {
        for (const config of configs) {
            const message = new config();
            this.config.set(message.type, config);
        };
    }

    private byteLength(field: Field, value: any) {
        if (!(field.type in BinaryTypes)) {
            throw new Error(`Unsupported Net Type: ${field.type}`);
        }
        if (typeof BinaryTypes[field.type].length === 'function') {
            // @ts-ignore
            return BinaryTypes[field.type].length(value);
        } else {
            return BinaryTypes[field.type].length;
        }
    }

    public write<T extends NetMessage>(data: T): ArrayBuffer {
        const params = data.getParams();
        let size = 0;

        for (const [key, param] of params) {
            size += this.byteLength(param, data[key as (keyof T)]);
        }

        const buffer = new ArrayBuffer(size + 1); // Pad for header

        const view = new DataView(buffer);

        view.setUint8(0, data.type);

        let offset = 1;

        for (const [key, param] of params) {
            const value = data[key as (keyof T)];
            BinaryTypes[param.type].write(view, offset, value);
            offset += this.byteLength(param, value);
        }

        return buffer;
    }

    public read<T extends NetMessage>(data: ArrayBuffer): T {

        const view = new DataView(data);

        const type = view.getUint8(0);

        if (!this.config.has(type)) {
            throw new Error(`Invalid Message Type ${type}`);
        }

        const out = new (this.config.get(type)!)() as T;

        out.type = type;

        let offset = 1;

        for (const [key, param] of out.getParams()) {
            out[key as (keyof T)] = BinaryTypes[param.type].read(view, offset);
            offset += this.byteLength(param, out[key as (keyof T)]);
        }
        
        return out;
    }
}