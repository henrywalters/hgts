import { Transform } from "../common/components/transform";
import { ITransform } from "../core/transform";
import { ComponentCtr, IComponent, IComponentRegistry } from "./interfaces/component";
import { IEntity } from "./interfaces/entity";
import { HGObject } from "../core/object";
import { IScene } from "../core/interfaces/scene";
import { EntityEvents } from "../core/events";
import { Vector3 } from "three";

export class Entity extends HGObject implements IEntity {

    public children: Entity[] = [];
    public parent?: Entity;

    public name: string = "";

    private _scene: IScene;
    public get scene() { return this._scene; }

    public get transform(): ITransform {
        return this.scene.components.get(this, Transform)!;
    }

    public get position(): Vector3 {
        const pos = this.transform.position.clone();
        let node = this.parent;
        while (node) {
            pos.add(node.transform.position);
            node = node.parent;
        }
        return pos;
    }

    public get scale(): Vector3 {
        const scale = this.transform.scale.clone();
        let node = this.parent;
        while (node) {
            scale.multiply(node.transform.scale);
            node = node.parent;
        }
        return scale;
    }

    public get rotation(): Vector3 {
        return this.transform.rotation;
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

    getComponentInChildren<T extends IComponent>(ctr: ComponentCtr<T>): T | undefined {
        for (const child of this.children) {
            const component = child.getComponent(ctr);
            if (component) return component;
        }
        return void 0;
    }
}