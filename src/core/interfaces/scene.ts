import { Scene, WebGLRenderer } from "three";
import { IComponentRegistry } from "../../ecs/interfaces/component";
import { EntityData, IEntity } from "../../ecs/interfaces/entity";
import { ISystem, SystemCtr } from "../../ecs/interfaces/system";
import { IGame } from "./game";

export interface SceneData {
    entities: EntityData[];
}

export interface IScene {
    entities: IEntity[];
    components: IComponentRegistry;
    systems: ISystem[];

    game: IGame;
    scene: Scene;

    clear(): void;

    save(): SceneData;
    load(data: SceneData): void;

    onInitialize(): void;
    onActivate(): void;
    onDeactivate(): void;

    onUpdate(dt: number): void;
    onResize(width: number, height: number): void;

    addEntity(name?: string): IEntity;
    getEntity(id: number): IEntity | null;
    addSystem<T extends ISystem>(ctr: SystemCtr<T>): ISystem;
    initialize(): void;
    update(dt: number): void;
}

export type SceneCtr<T extends IScene> = {
    new (game: IGame): T;
    name: string;
}