import { Vector2 } from "three";
import { IComponent } from "../ecs/interfaces/component";
import { IEntity } from "../ecs/interfaces/entity";
import { IGame } from "./interfaces/game";
import { IScript, ScriptCtr } from "./interfaces/script";
import { Field } from "./reflection";

export class Script implements IScript {

    private _fields: Map<string, Field> = new Map();

    private _entity: IEntity;

    public get entity() { return this._entity; }

    public get scene() { return this._entity.scene; }

    public get input() { return this.game.input; }

    constructor(component: IComponent) {
        this._entity = component.entity;
    }

    onStart(): void {}
    onBeforeUpdate(): void {}
    onUpdate(dt: number): void {}
    onAfterUpdate(): void {}    

    setParam(name: string, field: Field): void {
        this._fields.set(name, field);
    }

    getParams(): Map<string, Field> {
        return this._fields;
    }

    protected get game(): IGame {
        return this.entity.scene.game;
    }

    protected get gameSize(): Vector2 {
        const size = new Vector2();
        this.game.renderer.getSize(size);
        return size;
    }
}

export interface ScriptInstances {
    ctr: ScriptCtr<any>;
    instances: Map<number, IScript>;
}

class _ScriptRegistry {
    private _registry: Map<string, ScriptInstances> = new Map();

    public get registry() { return this._registry; }

    public register<T extends Script>(ctr: ScriptCtr<T>): void {
        if (this.registry.has(ctr.name)) {
            throw new Error(`Script: '${ctr.name}' already registered.`);
        }
        this.registry.set(ctr.name, {
            ctr,
            instances: new Map(),
        });
    }

    public instantiate(name: string, component: IComponent): IScript {
        if (!this.registry.has(name)) {
            throw new Error(`Script '${name}' is not registered`);
        }

        if (this.registry.get(name)!.instances.has(component.id)) {
            return this.registry.get(name)!.instances.get(component.id)!;
        }

        const script = new (this.registry.get(name)!.ctr)(component);

        this.registry.get(name)!.instances.set(component.id, script);

        return script;
    }

    public get(name: string, component: IComponent): IScript | null {
        if (!this.registry.has(name)) {
            return null;
        }

        if (!this.registry.get(name)!.instances.has(component.id)) {
            return this.instantiate(name, component);
        }

        return this.registry.get(name)!.instances.get(component.id)!;
    }
}

export const ScriptRegistry = new _ScriptRegistry();
