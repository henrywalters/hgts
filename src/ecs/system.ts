import { ISystem } from "./interfaces/system";
import { IScene } from "../core/interfaces/scene";

export class System implements ISystem {

    private _world: IScene;

    protected get scene() { return this._world; }

    constructor(scene: IScene) {
        this._world = scene;
    }

    onInit(): void {
        return;
    }

    onStart(): void {
        return;
    }

    onBeforeUpdate(): void {
        return;
    }
    
    onUpdate(dt: number): void {
        return;
    }

    onAfterUpdate(): void {
        return;
    }
    
}