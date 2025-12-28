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
import { EntityEvents } from "./events";
import { Script, ScriptRegistry } from "./script";
import { Behavior } from "../common/components/behavior";
import { IScript } from "./interfaces/script";

export class Scene implements IScene {

    private _systems: ISystem[] = [];
    private _entities: IEntity[] = [];
    private _entityMap: Map<number, IEntity> = new Map();
    private _components: ComponentRegistry = new ComponentRegistry();
    private _game: IGame;

    private _scene: RenderScene = new RenderScene();

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
        const data: SceneData = {
            entities: [],
        };

        for (const entity of this.entities) {
            const el: EntityData = {
                id: entity.id,
                name: entity.name,
                children: [],
                components: []
            };

            for (const component of entity.getComponents()) {
                const comp: ComponentData = {
                    id: component.id,
                    name: component.constructor.name,
                    params: {}
                };

                for (const [key, param] of component.getParams()) {
                    // @ts-ignore
                    comp.params[key] = serialize(param, component[key]);
                }

                if (component instanceof Behavior) {
                    const script = ScriptRegistry.get(component.scriptName, component)!;
                    for (const [key, param] of script.getParams()) {
                        // @ts-ignore
                        comp.params[key] = serialize(param, script[key]);
                    }
                }

                el.components.push(comp);
            }

            data.entities.push(el);
        }

        return data;
    }
    load(data: SceneData): void {
        this.clear();

        for (const entityData of data.entities) {
            const entity = this.addEntity(entityData.name, entityData.id);
            for (const componentData of entityData.components) {
                const component = this.components.addByName(entity, componentData.name);
                const params = component.getParams();
                for (const key in componentData.params) {
                    if (!params.has(key)) {
                        continue;
                    }
                    const field = params.get(key)!;
                    // @ts-ignore
                    component[key] = deserialize(field, componentData.params[key]);
                }

                if (component instanceof Behavior) {
                    const script = ScriptRegistry.get(component.scriptName, component);
                    const scriptParams = script!.getParams();
                    for (const key in componentData.params) {
                        if (!scriptParams.has(key)) continue;
                        // @ts-ignore
                        script[key] = deserialize(scriptParams.get(key)!, componentData.params[key]);
                    }
                }

                this.game.entityEvents.emit({
                    type: EntityEvents.AddComponent,
                    entity: entity,
                    component: component,
                });
            }
        }
    }

    public onUpdate(dt: number): void {}

    public onResize(width: number, height: number): void {}

    public onInitialize(): void {
        
    }

    public onActivate(): void {}

    public onDeactivate(): void {}

    public addEntity(name: string = "", id?: number) {
        const entity = new Entity(name, this, id);
        this.entities.push(entity);
        this._entityMap.set(entity.id, entity);
        return entity;
    }

    public getEntity(id: number): IEntity | null {
        if (this._entityMap.has(id)) {
            return this._entityMap.get(id) as IEntity;
        }
        return null;
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