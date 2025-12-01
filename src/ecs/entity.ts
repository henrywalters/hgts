import { Transform } from "../common/components/transform";
import { ITransform } from "../core/transform";
import { ComponentCtr, IComponent, IComponentRegistry } from "./interfaces/component";
import { IEntity } from "./interfaces/entity";
import { Object } from "./object";

export class Entity extends Object implements IEntity {

    public children: Entity[] = [];
    public name: string = "";

    private registry: IComponentRegistry;

    public get transform(): ITransform {
        return this.registry.get(this, Transform)!;
    }

    constructor(name = "", registry: IComponentRegistry) {
        super();
        this.registry = registry;
        this.name = name;
    }

    addComponent<T extends IComponent>(ctr: ComponentCtr<T>) {
        return this.registry.add(this, ctr);
    }

    removeComponent(component: IComponent) {
        this.registry.remove(this, component);
    }

    removeComponents<T extends IComponent>(ctr: ComponentCtr<T>) {
        this.registry.removeAll(this, ctr);
    }
}