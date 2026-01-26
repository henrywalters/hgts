import { Color as TColor, Vector2 as TVector2, Vector3 as TVector3 } from "three";

export enum Types {
    String = 'string',
    Int = 'int',
    Float = 'float',
    Boolean = 'boolean',
    Vector2 = 'vector2',
    Vector3 = 'vector3',
    Color = 'color',
    Enum = 'enum',
    Script = 'script',
    Entity = 'entity',
    Class = 'class',
    Array = 'array',
}

export interface Ctr<T> {
    new (): T;
    name: string;
}

export interface Field {
    type: Types;
    subType?: Types;
    ctr?: Ctr<any>;
    description?: string;
    defaultValue?: any;
    label?: string;
    enum?: Object;
    readonly?: boolean;
}

// export interface IParameterizable {
//     setParam(name: string, field: Field): void;
//     getParams(): Map<string, Field>;
// }

// export function Param(field: Field) {
//     return function (_: unknown, context: ClassFieldDecoratorContext) {
//         context.addInitializer(function() {
//             (this as IParameterizable).setParam(context.name as string, field);
//         })
//     }
// }

class _Reflection {
    private fields: Map<string, Map<string, Field>> = new Map();

    private traverse(obj: any, cb: (name: string) => void): void {

        let proto = obj.constructor;
        
        while (proto && proto.name) {
            cb(proto.name);
            proto = Object.getPrototypeOf(proto);
            
            if (proto.name === 'Object' || proto.name === 'Function' || proto.name === '') {
                break;
            }
        }
    }

    setParam(obj: any, name: string, field: Field) {
        const key = obj.constructor.name;
        if (!this.fields.has(key)) {
            this.fields.set(key, new Map<string, Field>());
        }
        this.fields.get(key)!.set(name, field);
    }

    getParams(obj: any): Map<string, Field> {
        const out = new Map<string, Field>();
        this.traverse(obj, (name) => {
            if (this.fields.has(name)) {
                for (const [fieldName, field] of this.fields.get(name)!) {
                    out.set(fieldName, field);
                }
            }
        })
        return out;
    }
}

export const Reflection = new _Reflection();

export function Param(field: Field) {
    return function (target: any, propertyKey: string) {
        Reflection.setParam(target, propertyKey, field);
        // (target as IParameterizable).setParam(propertyKey, field);
    }
}

export function String() {
    return Param({type: Types.String});
}

export function Int() {
    return Param({type: Types.Int});
}

export function Float() {
    return Param({type: Types.Float});
}

export function Boolean() {
    return Param({type: Types.Boolean});
}

export function Vector2() {
    return Param({type: Types.Vector2});
}

export function Vector3() {
    return Param({type: Types.Vector3});
}

export function Color() {
    return Param({type: Types.Color});
}

export function Enum(en: Object) {
    return Param({type: Types.Enum, enum: en});
}

export function Script() {
    return Param({type: Types.Script});
}

export function Entity() {
    return Param({type: Types.Entity});
}

export function Class(ctr: Ctr<any>) {
    return Param({type: Types.Class, ctr});
}

export function Array(arrType: Types, ctr?: Ctr<any>) {
    return Param({type: Types.Array, subType: arrType, ctr});
}

export function serialize(field: Field, value: any): any {
    if (field.type === Types.Vector3) {
        return [value.x, value.y, value.z];
    } else if (field.type === Types.Vector2) {
        return [value.x, value.y];
    } else if (field.type === Types.Color) {
        return [value.r, value.g, value.b];
    } else {
        return value;
    }
}

export function deserialize(field: Field, value: any): any {
    if (field!.type === Types.Vector3) {
        return new TVector3(value[0], value[1], value[2]);
    } else if (field!.type === Types.Vector2) {
        return new TVector2(value[0], value[1]);
    } else if (field!.type === Types.Color) {
        return new TColor(value[0], value[1], value[2]);
    } else {
        return value;
    }
}