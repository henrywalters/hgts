import { Clock, WebGLRenderer } from "three";
import { IScene, SceneCtr } from "./scene";
import EventListenerPool, { EntityEvent, SceneEvent } from "../events";
import { IInput } from "./input";
import { IClient } from "../../net/interfaces/client";
import { IServer } from "../../net/interfaces/server";

export interface IGame {
    renderer: WebGLRenderer;
    currentScene: IScene | null;
    input: IInput;
    clock: Clock;
    scenes: Map<string, IScene>;

    client: IClient;
    server: IServer;

    sceneEvents: EventListenerPool<SceneEvent>;

    addScene<T extends IScene>(name: string, scene: SceneCtr<T>): T;
    
    activateScene(name: string | null): void;
    
    run(): void;

    tick(headless: boolean): void;
    
    resize(width: number, height: number): void;
}