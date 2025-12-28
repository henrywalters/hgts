import { IScene } from "../../core/interfaces/scene";
import { ITransform } from "../../core/transform";
import { ComponentCtr, ComponentData, IComponent } from "./component";

export interface EntityData {
    id: number;
    name: string;
    children: EntityData[];
    components: ComponentData[];
}

export interface IEntity {
    id: number;
    name: string;
    children: IEntity[];
    transform: ITransform;
    scene: IScene;

    addComponent<T extends IComponent>(ctr: ComponentCtr<T>): T;

    getComponent<T extends IComponent>(ctr: ComponentCtr<T>): T | undefined;

    getComponents(): IComponent[];
    
    removeComponent(component: IComponent): void;
    
    removeComponents<T extends IComponent>(ctr: ComponentCtr<T>): void;
}