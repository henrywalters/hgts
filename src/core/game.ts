import { Clock, WebGLRenderer } from "three";
import { IScene, SceneCtr } from "./interfaces/scene";
import { IGame } from "./interfaces/game";
import { Input } from "./input";
import EventListenerPool, { EntityEvent, SceneEvent } from "./events";
import { IManifest } from "./interfaces/manifest";
import { ScriptRegistry } from "./script";

export class Game implements IGame {
    private scenes: Map<string, IScene> = new Map();
    private activeScene: string | null = null;
    
    private _input: Input;
    private _renderer = new WebGLRenderer();
    private _clock = new Clock();

    public get renderer() { return this._renderer; }
    public get clock() { return this._clock; }
    public get input() { return this._input; }

    private _entityEvents: EventListenerPool<EntityEvent> = new EventListenerPool<EntityEvent>();
    private _sceneEvents: EventListenerPool<SceneEvent> = new EventListenerPool<SceneEvent>();
    public get entityEvents() { return this._entityEvents; }
    public get sceneEvents() { return this._sceneEvents; }

    public get currentScene() { return this.activeScene === null ? null : this.scenes.get(this.activeScene)!;}

    constructor(manifest: IManifest) {
        this._input = new Input(this.renderer.domElement);

        const gl = this.renderer.getContext();

        // try to get the debug extension
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')!;

        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const rendererName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        console.log('GPU Vendor:', vendor);
        console.log('GPU Renderer:', rendererName);

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
        }
    }

    private tick() {

        this.input.update();

        if (this.activeScene !== null) {
            this.scenes.get(this.activeScene)!.update(this.clock.getDelta());
        }
        requestAnimationFrame((t) => {this.tick()});
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