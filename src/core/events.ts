import { IComponent } from "../ecs/interfaces/component";
import { IEntity } from "../ecs/interfaces/entity";
import { Object } from "./object";

export enum EntityEvents {
    Create = 'create',
    Select = 'select',
    Remove = 'remove',
    Change = 'change',
    AddComponent = 'add_component',
    RemoveComponent = 'remove_component',
    UpdateComponent = 'update_component',
}

export enum SceneEvents {
    New,
    Load,
    Save,
}

export interface EntityEvent {
    type: EntityEvents;
    entity: IEntity,
    component?: IComponent,
}

export interface SceneEvent {
    type: SceneEvents;
}

export class EventListener<T> extends Object {

    public readonly handler: (payload: T) => void
    public readonly pool: EventListenerPool<T>;

    constructor(pool: EventListenerPool<T>, handler: (payload: T) => void) {
        super();
        this.pool = pool;
        this.handler = handler;
    }


    public remove() {
        this.pool.remove(this);
    }
}

export default class EventListenerPool<T> {
    private readonly pool: {[id: string]: EventListener<T>};

    constructor() {
        this.pool = {};
    }

    public listen(handler: (payload: T) => void): EventListener<T> {
        const listener = new EventListener<T>(this, handler);
        this.pool[listener.id] = listener;
        return listener;
    }

    public remove(listener: EventListener<T>) {
        if (listener.id in this.pool) {
            delete this.pool[listener.id];
        }
    }

    public emit(payload: T) {
        for (const id in this.pool) {
            this.pool[id].handler(payload);
        }
    }
}