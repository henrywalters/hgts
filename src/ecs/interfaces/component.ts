import { IEntity } from "./entity";

export interface IComponent {
    id: number;
    entity: IEntity;
}

export type ComponentCtr<T extends IComponent> = {
    new (entity: IEntity): T;
    name: string;
}

export interface IComponentPool<T extends IComponent> {
    add(entity: IEntity, ctr: T): T;
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
    add<T extends IComponent>(entity: IEntity, ctr: ComponentCtr<T>): T;
    addByName(entity: IEntity, name: string): IComponent;
    remove<T extends IComponent>(entity: IEntity, component: T): void;
    removeAll<T extends IComponent>(entity: IEntity, ctr: ComponentCtr<T>): void;
    removeAllByName(entity: IEntity, name: string): void;
    forEach<T extends IComponent>(ctr: ComponentCtr<T>, cv: (comp: T) => void): void;
    forEachByName(name: string, cv: (comp: IComponent) => void): void;
    get<T extends IComponent>(entity: IEntity, ctr: ComponentCtr<T>): T | undefined;
    getByName(entity: IEntity, name: string):  IComponent | undefined;
}