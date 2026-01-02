import { Clock, WebGLRenderer } from "three";
import { IScene, SceneCtr } from "./interfaces/scene";
import { IGame } from "./interfaces/game";
import { Input } from "./input";
import EventListenerPool, { EntityEvent, SceneEvent, SceneEvents } from "./events";
import { IManifest } from "./interfaces/manifest";
import { ScriptRegistry } from "./script";
import { Assets } from "./assets";
import { IClient } from "../net/interfaces/client";
import { IServer } from "../net/interfaces/server";
import { Server } from "../net/server";
import { Client } from "../net/client";

export class Game implements IGame {
    private _scenes: Map<string, IScene> = new Map();
    private activeScene: string | null = null;
    
    private _input: Input | null = null;
    private _renderer: WebGLRenderer | null = null;
    private _clock = new Clock();

    private _client?: IClient;
    private _server?: IServer;

    public get client() {
        if (!this._client) {
            throw new Error("Client not registered");
        }
        return this._client;
    }

    public get server() {
        if (!this._server) {
            throw new Error("Server not registered");
        }
        return this._server;
    }

    public get renderer() { 
        if (!this._renderer) {
            throw new Error("Running in headless mode");
        }
        return this._renderer; 
    }
    public get clock() { return this._clock; }
    public get input() { 
        if (!this._input) {
            throw new Error("Running in headless mode");
        }
        return this._input;
    }

    public get scenes() { return this._scenes; }

    private _sceneEvents: EventListenerPool<SceneEvent> = new EventListenerPool<SceneEvent>();
    public get sceneEvents() { return this._sceneEvents; }

    public get currentScene() { return this.activeScene === null ? null : this.scenes.get(this.activeScene)!;}

    constructor(manifest: IManifest, headless: boolean = false) {

        if (headless) {
            console.log("Running in headless mode");
        } else {
            this._renderer = new WebGLRenderer();
            this._input = new Input(this.renderer.domElement);
            const gl = this.renderer.getContext();

            // try to get the debug extension
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')!;

            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const rendererName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

            console.log('GPU Vendor:', vendor);
            console.log('GPU Renderer:', rendererName);
        }

        this.loadManifest(manifest);
    }

    public loadManifest(manifest: IManifest) {

        if (manifest.server) {
            this._server = new Server(manifest.server.address, manifest.server.clientMessages, manifest.server.serverMessages);
        }

        if (manifest.client) {
            this._client = new Client(manifest.client.address, manifest.client.clientMessages, manifest.client.serverMessages);
        }

        if (manifest.assets.fonts) {
            for (const font of manifest.assets.fonts) {
                Assets.loadFont(font).then(() => {
                    console.log(`Loaded font: ${font.name}`);
                });
            }
        }

        for (const script of manifest.scripts) {
            ScriptRegistry.register(script);
        }

        for (const name in manifest.scenes) {
            const scene = this.addScene(name, manifest.scenes[name].ctr);

            for (const system of manifest.systems) {
                scene.addSystem(system);
            }

            for (const component of manifest.components) {
                scene.components.register(component);
            }

            scene.load(manifest.scenes[name].data);

            scene.initialize();
        }

        this.activateScene(manifest.startScene);
    }

    public addScene<T extends IScene>(name: string, scene: SceneCtr<T>): T {
        const obj = new scene(this);
        this.scenes.set(name, obj);
        return obj;
    }

    public activateScene(name: string | null) {
        if (this.activeScene !== null) {
            this.scenes.get(this.activeScene)!.onDeactivate();
        }
        this.activeScene = name;
        if (this.activeScene !== null) {
            this.scenes.get(this.activeScene)!.onActivate();
            this.sceneEvents.emit({type: SceneEvents.New});
        }
    }

    public tick(headless: boolean = false) {

        if (!headless) {
            this.input.update();
        }

        if (this.activeScene !== null) {
            this.scenes.get(this.activeScene)!.update(this.clock.getDelta());
        }

        if (!headless) {
            requestAnimationFrame((t) => {this.tick()});
        }
    }

    public run() {
        requestAnimationFrame((t) => {this.tick()});
    }

    public resize(width: number, height: number): void {
        this.renderer.setSize(width, height);
        if (this.activeScene !== null) {
            this.scenes.get(this.activeScene)!.onResize(width, height);
        }
    }
}