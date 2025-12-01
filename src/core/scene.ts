import { Scene as RenderScene, WebGLRenderer } from "three";
import { ComponentRegistry } from "../ecs/component";
import { Entity } from "../ecs/entity";
import { ISystem, SystemCtr } from "../ecs/interfaces/system";
import { IScene } from "./interfaces/scene";
import { IEntity } from "../ecs/interfaces/entity";
import { Transform } from "../common/components/transform";

export class Scene implements IScene {

    private _systems: ISystem[] = [];
    private _entities: IEntity[] = [];
    private _components: ComponentRegistry = new ComponentRegistry();

    private _scene: RenderScene = new RenderScene();
    private _renderer: WebGLRenderer = new WebGLRenderer();

    public get scene() { return this._scene; }
    public get renderer() { return this._renderer; }

    public get systems() { return this._systems; }
    public get entities() { return this._entities; }
    public get components() { return this._components; }

    public onStart(): void {}

    public onUpdate(dt: number): void {}

    public onResize(width: number, height: number): void {}

    public addEntity(name: string = "") {
        const entity = new Entity(name, this.components);
        entity.addComponent(Transform);
        this.entities.push(entity);
        return entity;
    }

    public addSystem<T extends ISystem>(ctr: SystemCtr<T>): T {
        const system = new ctr(this);
        system.onInit();
        this.systems.push(system);
        return system;
    }

    public start() {

        this.components.register(Transform);

        this.onStart();

        for (const system of this.systems) {
            system.onStart();
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

    public resize(width: number, height: number): void {
        this.renderer.setSize(width, height);
        this.onResize(width, height);
    }
}