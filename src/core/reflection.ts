import { Vector2, Vector3 } from "three";
import { IComponent } from "../ecs/interfaces/component";

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
}

export interface Field {
    type: Types;
    description?: string;
    defaultValue?: any;
    label?: string;
    enum?: Object;
}

export interface IParameterizable {
    setParam(name: string, field: Field): void;
    getParams(): Map<string, Field>;
}

export function Param(field: Field) {
    return function (_: unknown, context: ClassFieldDecoratorContext) {
        context.addInitializer(function() {
            (this as IParameterizable).setParam(context.name as string, field);
        })
    }
}

export function serialize(field: Field, value: any): any {
    if (field.type === Types.Vector3) {
        return [value.x, value.y, value.z];
    } else if (field.type === Types.Vector2) {
        return [value.x, value.y];
    } else {
        return value;
    }
}

export function deserialize(field: Field, value: any): any {
    if (field!.type === Types.Vector3) {
        return new Vector3(value[0], value[1], value[2]);
    } else if (field!.type === Types.Vector2) {
        return new Vector2(value[0], value[1]);
    } else {
        return value;
    }
}