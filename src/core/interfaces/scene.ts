import { Scene, WebGLRenderer } from "three";
import { IComponentRegistry } from "../../ecs/interfaces/component";
import { EntityData, IEntity } from "../../ecs/interfaces/entity";
import { ISystem, SystemCtr } from "../../ecs/interfaces/system";
import { IGame } from "./game";
import EventListenerPool, { EntityEvent } from "../events";

export interface SceneData {
    entities: EntityData[];
}

export interface IScene {
    entities: IEntity[];
    components: IComponentRegistry;
    systems: ISystem[];

    game: IGame;
    scene: Scene;

    entityEvents: EventListenerPool<EntityEvent>;

    clear(): void;

    save(): SceneData;
    load(data: SceneData): void;

    onInitialize(): void;
    onActivate(): void;
    onDeactivate(): void;

    onUpdate(dt: number): void;
    onResize(width: number, height: number): void;

    removeEntity(id: number): void;
    addEntityFromPrefab(prefab: EntityData, name?: string, id?: number, parentId?: number): IEntity;
    addEntity(name?: string, id?: number, parentId?: number): IEntity;
    changeEntityOwner(id: number, parentId?: number): void;
    getEntity(id: number): IEntity | null;
    addSystem<T extends ISystem>(ctr: SystemCtr<T>): ISystem;
    initialize(): void;
    update(dt: number): void;

    forEachEntity(cb: (entity: IEntity) => void): void;

    getEntityByName(name: string, parent?: IEntity): IEntity | null;
}

export type SceneCtr<T extends IScene> = {
    new (game: IGame): T;
    name: string;
}