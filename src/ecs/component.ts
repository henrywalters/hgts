import { IComponent, IComponentPool, ComponentCtr, IRegisteredComponent, IComponentRegistry } from "./interfaces/component";
import { IEntity } from "./interfaces/entity";
import { HGObject } from "../core/object";
import { Field } from "../core/reflection";
import { EntityEvents } from "../core/events";

export class Component extends HGObject implements IComponent {

    private _entity: IEntity;

    public get entity() { return this._entity; }

    constructor(entity: IEntity) {
        super();
        this._entity = entity;
    }

    notifyUpdate() {
        this.entity.scene.entityEvents.emit({
            type: EntityEvents.UpdateComponent,
            entity: this.entity,
            component: this,
        });
    }
}

export class ComponentPool<T extends IComponent> implements IComponentPool<T> {
    private components: (T | null)[] = [];
    private owners: (number | null)[] = [];
    private freeList: number[] = [];
    private entityToSlots: Map<number, number[]> = new Map();

    public clear() {
        this.components = [];
        this.owners = [];
        this.freeList = [];
        this.entityToSlots = new Map();
    }

    public add(entity: IEntity, component: T) {
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

    public remove(entity: IEntity, component: IComponent) {
        const slots = this.entityToSlots.get(entity.id);
        if (!slots || slots.length === 0) return;

        const slot = slots.pop()!;
        this.components[slot] = null;
        this.owners[slot] = null;
        this.freeList.push(slot);

        if (slots.length === 0) this.entityToSlots.delete(entity.id);
    }

    public removeAll(entity: IEntity) {
        const slots = this.entityToSlots.get(entity.id);
        if (!slots) return;

        for (const slot of slots) {
            this.components[slot] = null;
            this.owners[slot] = null;
            this.freeList.push(slot);
        }
        this.entityToSlots.delete(entity.id);
    }

    public get(entity: IEntity): T | undefined {
        if (!this.has(entity) || this.entityToSlots.get(entity.id)!.length === 0) return void 0;
        return this.components[this.entityToSlots.get(entity.id)![0]]!;
    }

     public getAll(entity: IEntity): T[] {
        if (!this.has(entity)) return [];
        return this.entityToSlots.get(entity.id)!
            .map((index) => this.components[index]!);
    }

    public has(entity: IEntity): boolean {
        return this.entityToSlots.has(entity.id);
    }

    public forEach(callback: (component: T) => void): void {
        for (let i = 0; i < this.components.length; i++) {
            if (this.components[i] !== null) callback(this.components[i]!);
        }
    }
}

export class ComponentRegistry implements IComponentRegistry {

    private ctrToComponent: Map<ComponentCtr<any>, IRegisteredComponent<any>> = new Map();
    private nameToCtr: Map<string, ComponentCtr<any>> = new Map();

    public register<T extends IComponent>(ctr: ComponentCtr<T>, name: string = ctr.name) {
        this.ctrToComponent.set(ctr, {
            name,
            className: ctr.name,
            ctr,
            pool: new ComponentPool<T>(),
        });
        this.nameToCtr.set(name, ctr);
    }

    public getComponents(): IRegisteredComponent<any>[] {
        const components = [];
        for (const [ctr, component] of this.ctrToComponent) {
            components.push(component);
        }
        return components;
    }

    private getReg<T extends IComponent>(ctr: ComponentCtr<T>) {
        return this.ctrToComponent.get(ctr)!;
    }

    private getRegByClass<T extends IComponent>(cls: T) {
        return this.ctrToComponent.get(cls.constructor as ComponentCtr<any>)!;
    }

    private getRegByName(name: string) {
        return this.ctrToComponent.get(this.nameToCtr.get(name)!)!;
    }

    public clear() {
        for (const [ctr, component] of this.ctrToComponent) {
            component.pool.clear();
        }
    }

    public add<T extends IComponent>(entity: IEntity, ctr: ComponentCtr<T>): T {
        const registered = this.getReg(ctr);
        return registered.pool.add(entity, new registered.ctr(entity));
    }

    public addByName(entity: IEntity, name: string): Component {
        const registered = this.getRegByName(name);
        return registered.pool.add(entity, new registered.ctr(entity));
    }

    public remove<T extends IComponent>(entity: IEntity, component: T) {
        const registered = this.getRegByClass(component);
        return registered.pool.remove(entity, component);
    }

    public removeAll<T extends IComponent>(entity: IEntity, ctr: ComponentCtr<T>) {
        const registered = this.getReg(ctr);
        return registered.pool.removeAll(entity);
    }

    public removeAllByName(entity: IEntity, name: string) {
        const registered = this.getRegByName(name);
        return registered.pool.removeAll(entity);
    }

    public forEach<T extends IComponent>(ctr: ComponentCtr<T>, cb: (comp: T) => void) {
        const registered = this.getReg(ctr);
        (registered.pool as ComponentPool<T>).forEach(cb);
    }

    public forEachByName(name: string, cb: (comp: Component) => void) {
        const registered = this.getRegByName(name);
        registered.pool.forEach(cb);
    }

    public get<T extends IComponent>(entity: IEntity, ctr: ComponentCtr<T>) {
        const registered = this.getReg(ctr);
        return registered.pool.get(entity);
    }

    public getAll(entity: IEntity) {
        const components = [];
        for (const type of this.ctrToComponent.keys()) {
            const component = this.get(entity, type);
            if (component) {
                components.push(component);
            }
        }
        return components;
    }

    public getByName(entity: IEntity, name: string) {
        const registered = this.getRegByName(name);
        return registered.pool.get(entity);
    }
}