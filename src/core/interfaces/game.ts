import { WebGLRenderer } from "three";
import { IScene, SceneCtr } from "./scene";
import EventListenerPool, { EntityEvent, SceneEvent } from "../events";
import { IInput } from "./input";

export interface IGame {
    renderer: WebGLRenderer;
    currentScene: IScene | null;
    input: IInput;

    entityEvents: EventListenerPool<EntityEvent>;
    sceneEvents: EventListenerPool<SceneEvent>;

    addScene<T extends IScene>(name: string, scene: SceneCtr<T>): T;
    
    activateScene(name: string | null): void;
    
    run(): void;
    
    resize(width: number, height: number): void;
}