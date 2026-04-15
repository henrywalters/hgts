import { Clock, Vector2, WebGLRenderer } from "three";
import { IScene, SceneCtr } from "./scene";
import EventListenerPool, { EntityEvent, SceneEvent } from "../events";
import { IInput } from "./input";
import { IClient } from "../../net/interfaces/client";
import { IServer } from "../../net/interfaces/server";
import { AABB } from "../../utils/math";
import { IManifest } from "./manifest";

export interface IGame {
    renderer: WebGLRenderer;
    currentScene: IScene | null;
    input: IInput;
    clock: Clock;
    scenes: Map<string, IScene>;
    manifest: IManifest;

    client: IClient;
    server: IServer;

    running: boolean;

    sceneEvents: EventListenerPool<SceneEvent>;

    getScene(name: string): IScene;

    addScene<T extends IScene>(name: string, scene: SceneCtr<T>): T;
    
    activateScene(name: string | null): void;

    loadAssets(callback: (msg: string) => void): Promise<void>;
    
    run(): void;
    stop(): void;

    tick(timestamp: number, headless: boolean): void;

    getSize(): Vector2;
    getViewport(): AABB;
    
    resize(width: number, height: number): void;
}