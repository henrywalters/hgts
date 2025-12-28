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
import { Pong } from "../demos/pong/pong";
import { ScriptRegistry } from "../core/script";

export class Editor implements IEditor {
    
    private config: LayoutConfig;
    private layout: GoldenLayout;
    private _game: Game;

    public get game(): IGame { return this._game; }

    constructor(container: HTMLElement) {

        this._game = new Game(new Pong());

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
            
            if (id === 'new_scene') {
                this.game.currentScene?.clear();
                this.game.sceneEvents.emit({type: SceneEvents.New});
            }

            if (id === 'save_scene') {
                console.log(JSON.stringify(this.game.currentScene?.save()));
                this.game.sceneEvents.emit({type: SceneEvents.Save});
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