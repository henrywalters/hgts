import { GoldenLayout, LayoutConfig } from "golden-layout";
import { IEditorComponent } from "./interfaces/editorComponent";
import { GameView } from "./components/gameView";
import { EntityTree } from "./components/entityTree";
import { EntityView } from "./components/entityView";
import { AssetsView } from "./components/assetsView";
import { Game } from "../core/game";
import { Runtime } from "../demos/pong/runtime";
import { IEditor } from "./interfaces/editor";
import { IGame } from "../core/interfaces/game";
import EventListenerPool, { EntityEvents, SceneEvents } from "../core/events";
import { ClientDemo } from "../demos/server/client";
import { PongClientManifest } from "../demos/pongMultiplayer/client";
import { Vector2 } from "three";
import { UIManifest } from "../demos/ui/manifest";
import { UI } from "../common/systems/ui";
import { Renderer } from "../common/systems/renderer";
import { TestComponent } from "./testComponent";

export class Editor implements IEditor {
    
    private config: LayoutConfig;
    private layout: GoldenLayout;
    private _game: Game;

    private saveFile = "";

    public get game(): IGame { return this._game; }

    constructor(container: HTMLElement, game: Game) {

        console.log("New Game");

        //this._game = new Game(new PongClientManifest());
        this._game = game;

        // this._game = new Game({
        //     systems: [
        //         UI,
        //         Renderer,
        //     ],
        //     components: [
        //         TestComponent,
        //     ],
        //     scripts: [],
        //     scenes: {
        //         runtime: {
        //             data: {
        //                 entities: []
        //             },
        //             ctr: Runtime,
        //         }
        //     },
        //     assets: {},
        //     startScene: "runtime",
        // })

        this.config = {
            root: {
            type: 'row',
            content: [
                {
                    type: 'component',
                    componentType: 'EntityTree',
                    title: 'Entities',
                    size: '20%'
                },
                {
                    type: 'column',
                    content: [
                        {
                            type: 'component',
                            componentType: 'GameView',
                            title: 'Game',
                            size: '70%'
                        },
                        {
                            type: 'component',
                            componentType: 'AssetsView',
                            title: 'Assets',
                        }
                    ]
                },
                {
                    type: 'component',
                    componentType: 'EntityView',
                    title: 'Selected Entity',
                    size: '20%'
                }
            ]
        }

        };

        this.layout = new GoldenLayout(container);
        this.addComponent('GameView', new GameView(this));
        this.addComponent('EntityTree', new EntityTree(this));
        this.addComponent('EntityView', new EntityView(this));
        this.addComponent('AssetsView', new AssetsView(this));

        document.getElementById('file_menu')?.addEventListener('sl-select', (e) => {
            // @ts-ignore
            const id = e.detail.item.id;

            const saveAs = async () => {
                // @ts-ignore
                const file = await window.showSaveFilePicker({
                    suggestedName: 'scene.json',
                    types: [{
                        description: 'JSON Files',
                        accept: { 'text/plain': ['.json']}
                    }],
                });
                const writeable = await file.createWritable();
                await writeable.write(JSON.stringify(this.game.currentScene?.save(), null, 2));
                await writeable.close();
                this.game.sceneEvents.emit({type: SceneEvents.Save});
            };

            const load = async () => {
                // @ts-ignore
                const [fileHandle] = await window.showOpenFilePicker();
                const file = await fileHandle.getFile();
                const text = await file.text();
                const data = JSON.parse(text);
                this.game.currentScene?.load(data);
            }

            if (id === 'load_scene') {
                load();   
            }
            
            if (id === 'new_scene') {
                this.game.currentScene?.clear();
                this.game.sceneEvents.emit({type: SceneEvents.New});
            }

            if (id === 'save_scene') {
                if (this.saveFile === "") {
                    saveAs();
                }
            }

            if (id === 'save_scene_as') {
                saveAs();   
            }
        })
    }

    addComponent(name: string, component: IEditorComponent) {
        this.layout.registerComponentFactoryFunction(name, (container, state) => {
            component.render(container, state);
        });
    }

    initialize() { 
        this.layout.loadLayout(this.config);
        window.addEventListener('resize', () => {
            console.log("Update Size");
            this.layout.updateRootSize();
        });

        this.game.run();
    }
}