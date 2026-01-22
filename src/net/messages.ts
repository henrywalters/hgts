import { Color, Vector2, Vector3 } from "three";
import { Ctr, Field,  Reflection,  Types } from "../core/reflection";
import { BinaryField, INetMessage, INetMessages, NetMessageConfig, NetMessageCtr } from "./interfaces/messages";

export abstract class NetMessage implements INetMessage {

    abstract type: number;
}

function byteLength(field: Field, value: any) {
    if (!(field.type in BinaryTypes)) {
        throw new Error(`Unsupported Net Type: ${field.type}`);
    }
    if (typeof BinaryTypes[field.type].length === 'function') {
        // @ts-ignore
        return BinaryTypes[field.type].length(field, value);
    } else {
        return BinaryTypes[field.type].length;
    }
}

export const BinaryTypes: {[key: string]: BinaryField} = {
    [Types.Boolean]: {
        length: 1,
        write(field, view: DataView, offset: number, value: any) {
            view.setUint8(offset, value ? 1 : 0);
        },
        read(field, view: DataView, offset: number) {
            return view.getUint8(offset) === 1 ? true : false;
        }
    },
    [Types.Float]: {
        length: 4,
        write(field, view: DataView, offset: number, value: any) {
            view.setFloat32(offset, value);
        },
        read(field, view: DataView, offset: number) {
            return view.getFloat32(offset);
        }
    },
    [Types.Int]: {
        length: 4,
        write(field, view: DataView, offset: number, value: any) {
            view.setInt32(offset, value);
        },
        read(field, view: DataView, offset: number) {
            return view.getInt32(offset);
        }
    },
    [Types.Vector2]: {
        length: 8,
        write(field, view: DataView, offset: number, value: Vector2) {
            view.setFloat32(offset, value.x);
            view.setFloat32(offset + 4, value.y);
        },
        read(field, view: DataView, offset: number) {
            return new Vector2(
                view.getFloat32(offset),
                view.getFloat32(offset + 4)
            );
        }
    },
    [Types.Vector3]: {
        length: 12,
        write(field, view: DataView, offset: number, value: Vector3) {
            view.setFloat32(offset, value.x);
            view.setFloat32(offset + 4, value.y);
            view.setFloat32(offset + 8, value.z);
        },
        read(field, view: DataView, offset: number) {
            return new Vector3(
                view.getFloat32(offset),
                view.getFloat32(offset + 4),
                view.getFloat32(offset + 8),
            );
        }
    },
    [Types.Color]: {
        length: 12,
        write(field, view: DataView, offset: number, value: Color) {
            view.setFloat32(offset, value.r);
            view.setFloat32(offset + 4, value.g);
            view.setFloat32(offset + 8, value.b);
        },
        read(field, view: DataView, offset: number) {
            return new Color(
                view.getFloat32(offset),
                view.getFloat32(offset + 4),
                view.getFloat32(offset + 8),
            );
        }
    },
    [Types.String]: {
        length: (field, value: string) => {
            return 4 + value.length;
        },
        write(field, view: DataView, offset: number, value: string) {
            view.setInt32(offset, value.length);
            for (let i = 0; i < value.length; i++) {
                view.setUint8(offset + 4 + i, value[i].charCodeAt(0));
            }
        },
        read(field, view: DataView, offset: number) {
            const length = view.getInt32(offset);
            let out = "";
            for (let i = 0; i < length; i++) {
                out += String.fromCharCode(view.getUint8(offset + 4 + i));
            }
            return out;
        }
    },
    [Types.Class]: {
        length: (field: Field, value: any) => {
            const params = Reflection.getParams(value);

            let size = 0;

            for (const [key, param] of params) {
                size += byteLength(param, value[key]);
            }

            return size;
        },
        write(field, view: DataView, offset: number, value: any) {
            const params = Reflection.getParams(value);
            for (const [key, param] of params) {
            if (key in value) {
                BinaryTypes[param.type].write(field, view, offset, value[key]);
                offset += byteLength(param, value[key]);
            }
        }

        },
        read(field, view: DataView, offset: number) {
            if (!field.ctr) {
                throw new Error('Class type requires ctr parameter');
            }
            const out = new field.ctr();
            const params = Reflection.getParams(out);

            for (const [key, param] of params) {
                out[key] = BinaryTypes[param.type].read(param, view, offset);
                offset += byteLength(param, out[key]);
            }
            return out;
        }
    },
    [Types.Array]: {
        length: (field: Field, value: any[]) => {
            if (!field.subType) {
                throw new Error(`Array requires subType parameter`);
            }
            let size = 4;
            for (const el of value) {
                size += byteLength({type: field.subType}, el);
            }
            return size;
        },
        write(field: Field, view: DataView, offset: number, value: any[]) {
            if (!field.subType) {
                throw new Error(`Array requires subType parameter`);
            }
            view.setInt32(offset, value.length);
            offset += 4;

            for (const el of value) {
                BinaryTypes[field.subType].write(field, view, offset, el);
                offset += byteLength({type: field.subType}, el);
            }
        },
        read(field: Field, view: DataView, offset: number) {

            if (!field.subType) {
                throw new Error(`Array requires subType parameter`);
            }

            const out = [];
            const length = view.getInt32(offset);
            offset += 4;

            for (let i = 0; i < length; i++) {
                const value = BinaryTypes[field.subType].read(field, view, offset);
                offset += byteLength({type: field.subType}, value);
                out.push(value);
            }

            return out;
        }
    }
};

export class NetMessages implements INetMessages {
    private _config: NetMessageConfig = new Map();

    public get config() { return this._config; }

    constructor(configs: NetMessageCtr<any>[]) {
        for (const config of configs) {
            const message = new config();
            this.config.set(message.type, config);
        };
    }

    public write<T extends INetMessage>(data: T): ArrayBuffer {
        const params = Reflection.getParams(data);
        let size = 0;

        for (const [key, param] of params) {
            size += byteLength(param, data[key as (keyof T)]);
        }

        const buffer = new ArrayBuffer(size + 1); // Pad for header

        const view = new DataView(buffer);

        view.setUint8(0, data.type);

        let offset = 1;

        for (const [key, param] of params) {
            if (key in data) {
                const value = data[key as (keyof T)];
                BinaryTypes[param.type].write(param, view, offset, value);
                offset += byteLength(param, value);
            }
        }

        return buffer;
    }

    public read<T extends INetMessage>(data: ArrayBuffer): T {

        const view = new DataView(data);

        const type = view.getUint8(0);

        if (!this.config.has(type)) {
            throw new Error(`Invalid Message Type ${type}`);
        }

        const out = new (this.config.get(type)!)() as T;

        out.type = type;

        let offset = 1;

        for (const [key, param] of Reflection.getParams(out)) {
            out[key as (keyof T)] = BinaryTypes[param.type].read(param, view, offset);
            offset += byteLength(param, out[key as (keyof T)]);
        }
        
        return out;
    }
}