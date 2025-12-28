import { Field, IParameterizable } from "../../core/reflection";
import { IEntity } from "./entity";

export interface ComponentData {
    id: number;
    name: string;
    params: {[key: string]: any};
}

export interface IComponent extends IParameterizable {
    id: number;
    entity: IEntity;

    notifyUpdate(): void;
}

export type ComponentCtr<T extends IComponent> = {
    new (entity: IEntity): T;
    name: string;
}

export interface IComponentPool<T extends IComponent> {
    add(entity: IEntity, ctr: T): T;
    clear(): void;
    removeAll(entity: IEntity): void;
    remove(entity: IEntity, component: T): void;
    get(entity: IEntity): T | undefined;
    getAll(entity: IEntity): T[];
    has(entity: IEntity): boolean;
    forEach(callback: (component: T) => void): void;
}

export interface IRegisteredComponent<T extends IComponent> {
    name: string;
    className: string;
    ctr: ComponentCtr<T>;
    pool: IComponentPool<T>;
}

export interface IComponentRegistry {
    register<T extends IComponent>(ctr: ComponentCtr<T>): void;
    getComponents(): IRegisteredComponent<any>[];
    add<T extends IComponent>(entity: IEntity, ctr: ComponentCtr<T>): T;
    addByName(entity: IEntity, name: string): IComponent;
    clear(): void;
    remove<T extends IComponent>(entity: IEntity, component: T): void;
    removeAll<T extends IComponent>(entity: IEntity, ctr: ComponentCtr<T>): void;
    removeAllByName(entity: IEntity, name: string): void;
    forEach<T extends IComponent>(ctr: ComponentCtr<T>, cv: (comp: T) => void): void;
    forEachByName(name: string, cv: (comp: IComponent) => void): void;
    get<T extends IComponent>(entity: IEntity, ctr: ComponentCtr<T>): T | undefined;
    getAll(entity: IEntity): IComponent[];
    getByName(entity: IEntity, name: string):  IComponent | undefined;
}