import { Transform } from "../common/components/transform";
import { ITransform } from "../core/transform";
import { ComponentCtr, IComponent, IComponentRegistry } from "./interfaces/component";
import { IEntity } from "./interfaces/entity";
import { HGObject } from "../core/object";
import { IScene } from "../core/interfaces/scene";
import { EntityEvents } from "../core/events";

export class Entity extends HGObject implements IEntity {

    public children: Entity[] = [];
    public name: string = "";

    private _scene: IScene;
    public get scene() { return this._scene; }

    public get transform(): ITransform {
        return this.scene.components.get(this, Transform)!;
    }

    constructor(name = "", scene: IScene, id?: number) {
        super(id);
        this._scene = scene;
        this.name = name;
    }

    addComponent<T extends IComponent>(ctr: ComponentCtr<T>): T {
        const component = this.scene.components.add(this, ctr);
        this.scene.entityEvents.emit({
            type: EntityEvents.AddComponent,
            entity: this,
            component: component,
        });
        return component;
    }

    removeComponent(component: IComponent) {
        this.scene.entityEvents.emit({
            type: EntityEvents.RemoveComponent,
            entity: this,
            component: component,
        });
        this.scene.components.remove(this, component);
    }

    removeComponents<T extends IComponent>(ctr: ComponentCtr<T>) {
        this.scene.components.removeAll(this, ctr);
    }

    getComponents(): IComponent[] {
        return this.scene.components.getAll(this);
    }

    getComponent<T extends IComponent>(ctr: ComponentCtr<T>): T | undefined {
        return this.scene.components.get(this, ctr);
    }
}