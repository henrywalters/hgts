import { Scene, WebGLRenderer } from "three";
import { IComponentRegistry } from "../../ecs/interfaces/component";
import { IEntity } from "../../ecs/interfaces/entity";
import { ISystem, SystemCtr } from "../../ecs/interfaces/system";

export interface IScene {
    entities: IEntity[];
    components: IComponentRegistry;
    systems: ISystem[];

    scene: Scene;
    renderer: WebGLRenderer;

    onStart(): void;
    onUpdate(dt: number): void;
    onResize(width: number, height: number): void;

    addEntity(name: string): IEntity;
    addSystem<T extends ISystem>(ctr: SystemCtr<T>): ISystem;
    start(): void;
    update(dt: number): void;
    resize(width: number, height: number): void;
}