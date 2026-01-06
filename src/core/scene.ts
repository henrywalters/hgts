import { Scene as RenderScene, WebGLRenderer, Vector2, Vector3 } from "three";
import { ComponentRegistry } from "../ecs/component";
import { Entity } from "../ecs/entity";
import { ISystem, SystemCtr } from "../ecs/interfaces/system";
import { IScene, SceneData } from "./interfaces/scene";
import { EntityData, IEntity } from "../ecs/interfaces/entity";
import { Transform } from "../common/components/transform";
import { IGame } from "./interfaces/game";
import { ComponentData } from "../ecs/interfaces/component";
import { deserialize, serialize, Types } from "./reflection";
import EventListenerPool, { EntityEvent, EntityEvents } from "./events";
import { Script, ScriptRegistry } from "./script";
import { Behavior } from "../common/components/behavior";
import { IScript } from "./interfaces/script";
import { deserializeScene, serializeScene } from "./serialization";

export class Scene implements IScene {

    private _systems: ISystem[] = [];
    private _entities: IEntity[] = [];
    private _entityMap: Map<number, IEntity> = new Map();
    private _components: ComponentRegistry = new ComponentRegistry();
    private _game: IGame;

    private _scene: RenderScene = new RenderScene();

    private _entityEvents: EventListenerPool<EntityEvent> = new EventListenerPool<EntityEvent>();
    public get entityEvents() { return this._entityEvents; }

    public get scene() { return this._scene; }

    public get systems() { return this._systems; }
    public get entities() { return this._entities; }
    public get components() { return this._components; }
    public get game() { return this._game; }

    constructor(game: IGame) {
        this._game = game;
        this.components.register(Transform);
    }

    clear() {
        this.components.clear();
        this._entities = [];
        this._entityMap = new Map();
    }

    save(): SceneData {
        return serializeScene(this);    
    }

    load(data: SceneData): void {
        this.clear();
        deserializeScene(this, data);
    }

    public onUpdate(dt: number): void {}

    public onResize(width: number, height: number): void {}

    public onInitialize(): void {
        
    }

    public onActivate(): void {}

    public onDeactivate(): void {}

    removeEntity(entityId: IEntity | number): void {
        const entity = typeof entityId === 'number' ? this.getEntity(entityId) : entityId;
        if (!entity) return;

        for (const child of entity.children) {
            this.removeEntity(child);
        }

        const list = entity.parent ? entity.parent.children : this.entities;
        const index = list.findIndex((value) => value.id === entity.id);
        if (index >= 0) {
            this._entityMap.delete(entity.id);
            list.splice(index, 1);
            this.entityEvents.emit({
                type: EntityEvents.Remove,
                entity,
            })
        }
    }

    public addEntity(name: string = "", id?: number, parentId?: number) {
        const entity = new Entity(name, this, id);
        if (parentId) {
            const parent = this.getEntity(parentId);
            if (!parent) {
                throw new Error(`Entity #${parentId} does not exist`);
            }
            parent.children.push(entity);
            entity.parent = parent;
        } else {
            this.entities.push(entity);
        }

        this._entityMap.set(entity.id, entity);
        return entity;
    }

    public getEntity(id: number): Entity | null {
        if (this._entityMap.has(id)) {
            return this._entityMap.get(id) as Entity;
        }
        return null;
    }

    public changeEntityOwner(id: number, parentId?: number): void {

        if (id && parentId && id === parentId) return;

        const entity = this.getEntity(id);

        if (!entity) {
            console.error(`Entity #${id} does not exist`);
            return;
        }

        console.log(entity);

        const list = entity.parent ? entity.parent.children : this.entities;
        const index = list.findIndex((other) => other.id === entity.id);
        list.splice(index, 1);

        if (parentId) {
            const parent = this.getEntity(parentId);
            console.log(parent);
            if (!parent) {
                console.error(`Entity #${parentId} does not exist`);
                return;
            }
            entity.parent = parent;
            parent.children.push(entity);
        } else {
            entity.parent = void 0;
            this.entities.push(entity);
        }
    }

    public addSystem<T extends ISystem>(ctr: SystemCtr<T>): T {
        const system = new ctr(this);
        this.systems.push(system);
        return system;
    }

    public initialize() {

        this.onInitialize();

        for (const system of this.systems) {
            system.onInit();
        }
    }

    public update(dt: number) {

        this.onUpdate(dt);

        for (const system of this.systems) {
            system.onBeforeUpdate();
        }

        for (const system of this.systems) {
            system.onUpdate(dt);
        }

        for (const system of this.systems) {
            system.onAfterUpdate();
        }
    }
}