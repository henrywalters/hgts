import { Entity } from "./entity";
import { Object } from "./object";

export class Component extends Object {
    private _entity: Entity;

    public get entity() { return this._entity; }

    constructor(entity: Entity) {
        super();
        this._entity = entity;
    }
}

type ComponentCtr<T extends Component> = {
    new (entity: Entity): T;
    name: string;
}

export interface IComponentPool<T extends Component> {
    add(entity: Entity, ctr: T): T;
    removeAll(entity: Entity): void;
    remove(entity: Entity, component: T): void;
    get(entity: Entity): T | undefined;
    getAll(entity: Entity): T[];
    has(entity: Entity): boolean;
    forEach(callback: (component: T) => void): void;
}

export class ComponentPool<T extends Component> implements IComponentPool<T> {
    private components: (T | null)[] = [];
    private owners: (number | null)[] = [];
    private freeList: number[] = [];
    private entityToSlots: Map<number, number[]> = new Map();

    public add(entity: Entity, component: T) {
        let slot: number;

        if (this.freeList.length > 0) {
            slot = this.freeList.pop()!;
            this.components[slot] = component;
            this.owners[slot] = entity.id;
        } else {
            slot = this.components.length;
            this.components.push(component);
            this.owners.push(entity.id);
        }

        let slots = this.entityToSlots.get(entity.id);
        if (!slots) {
            slots = [];
            this.entityToSlots.set(entity.id, slots);
        }
        slots.push(slot);
        return component;
    }

    public remove(entity: Entity, component: Component) {
        const slots = this.entityToSlots.get(entity.id);
        if (!slots || slots.length === 0) return;

        const slot = slots.pop()!;
        this.components[slot] = null;
        this.owners[slot] = null;
        this.freeList.push(slot);

        if (slots.length === 0) this.entityToSlots.delete(entity.id);
    }

    public removeAll(entity: Entity) {
        const slots = this.entityToSlots.get(entity.id);
        if (!slots) return;

        for (const slot of slots) {
            this.components[slot] = null;
            this.owners[slot] = null;
            this.freeList.push(slot);
        }
        this.entityToSlots.delete(entity.id);
    }

    public get(entity: Entity): T | undefined {
        if (!this.has(entity) || this.entityToSlots.get(entity.id)!.length === 0) return void 0;
        return this.components[this.entityToSlots.get(entity.id)![0]]!;
    }

     public getAll(entity: Entity): T[] {
        if (!this.has(entity)) return [];
        return this.entityToSlots.get(entity.id)!
            .map((index) => this.components[index]!);
    }

    public has(entity: Entity): boolean {
        return this.entityToSlots.has(entity.id);
    }

    public forEach(callback: (component: T) => void): void {
        for (let i = 0; i < this.components.length; i++) {
            if (this.components[i] !== null) callback(this.components[i]!);
        }
    }
}

export interface IRegisteredComponent<T extends Component> {
    name: string;
    className: string;
    ctr: ComponentCtr<T>;
    pool: ComponentPool<T>;
}

export class ComponentRegistry {

    private ctrToComponent: Map<ComponentCtr<any>, IRegisteredComponent<any>> = new Map();
    private nameToCtr: Map<string, ComponentCtr<any>> = new Map();

    public register<T extends Component>(ctr: ComponentCtr<T>, name: string = ctr.name) {
        this.ctrToComponent.set(ctr, {
            name,
            className: ctr.name,
            ctr,
            pool: new ComponentPool<T>(),
        });
        this.nameToCtr.set(name, ctr);
    }

    private getReg<T extends Component>(ctr: ComponentCtr<T>) {
        return this.ctrToComponent.get(ctr)!;
    }

    private getRegByClass<T extends Component>(cls: T) {
        return this.ctrToComponent.get(cls.constructor as ComponentCtr<any>)!;
    }

    private getRegByName(name: string) {
        return this.ctrToComponent.get(this.nameToCtr.get(name)!)!;
    }

    public add<T extends Component>(entity: Entity, ctr: ComponentCtr<T>): T {
        const registered = this.getReg(ctr);
        return registered.pool.add(entity, new registered.ctr(entity));
    }

    public addByName(entity: Entity, name: string): Component {
        const registered = this.getRegByName(name);
        return registered.pool.add(entity, new registered.ctr(entity));
    }

    public remove<T extends Component>(entity: Entity, component: T) {
        const registered = this.getRegByClass(component);
        return registered.pool.remove(entity, component);
    }

    public removeAll<T extends Component>(entity: Entity, ctr: ComponentCtr<T>) {
        const registered = this.getReg(ctr);
        return registered.pool.removeAll(entity);
    }

    public removeAllByName(entity: Entity, name: string) {
        const registered = this.getRegByName(name);
        return registered.pool.removeAll(entity);
    }

    public forEach<T extends Component>(ctr: ComponentCtr<T>, cb: (comp: T) => void) {
        const registered = this.getReg(ctr);
        (registered.pool as ComponentPool<T>).forEach(cb);
    }

    public forEachByName(name: string, cb: (comp: Component) => void) {
        const registered = this.getRegByName(name);
        registered.pool.forEach(cb);
    }

    public get<T extends Component>(entity: Entity, ctr: ComponentCtr<T>) {
        const registered = this.getReg(ctr);
        return registered.pool.get(entity);
    }

    public getByName(entity: Entity, name: string) {
        const registered = this.getRegByName(name);
        return registered.pool.get(entity);
    }
}