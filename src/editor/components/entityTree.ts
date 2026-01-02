import { ComponentContainer } from "golden-layout";
import { IEditorComponent } from "../interfaces/editorComponent";
import { IGame } from "../../core/interfaces/game";
import { MeshComponent } from "../../common/components/mesh";
import { BoxGeometry, MeshBasicMaterial } from "three";
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import { EditorComponent } from "./editorComponent";
import { IEditor } from "../interfaces/editor";
import { EntityEvents, SceneEvents } from "../../core/events";
import { IEntity } from "../../ecs/interfaces/entity";
import { Transform } from "../../common/components/transform";

export class EntityTree extends EditorComponent implements IEditorComponent {

    private tree: HTMLDivElement;

    private index: number = 0;

    constructor(editor: IEditor) {
        super(editor);
        this.tree = document.createElement('div');

        for (const [name, scene] of this.editor.game.scenes) {
            scene.entityEvents.listen((e) => {
                if (e.type === EntityEvents.Create || e.type === EntityEvents.Remove) {
                    this.renderTree();
                } else if (e.type === EntityEvents.Change) {
                    const el = document.getElementById(`Entity_${e.entity.id}`);
                    if (el) {
                        const entity = e.entity;
                        if (entity) {
                            el.innerText = entity.name;
                        }
                    }
                }
            });
        }

        this.editor.game.sceneEvents.listen((e) => {
            if (e.type === SceneEvents.New) {
                this.renderTree();
            }
        })
    }

    renderTree() {
        this.tree.innerHTML = '';
        const root = document.createElement('sl-tree');
        if (this.editor.game.currentScene) {
            for (const entity of this.editor.game.currentScene.entities) {
                const item = document.createElement('sl-tree-item');
                item.innerText = entity.name;
                item.id = `Entity_${entity.id}`;
                item.setAttribute('entity-id', entity.id.toString());
                root.appendChild(item);
            }
        }
        root.addEventListener('sl-selection-change', (e) => {
            // @ts-ignore
            const el = e.detail.selection[0] as HTMLElement;
            this.editor.game.currentScene!.entityEvents.emit({
                type: EntityEvents.Select,
                entity: this.editor.game.currentScene!.getEntity(parseInt(el.getAttribute('entity-id') as string)) as IEntity,
            })
        })
        this.tree.appendChild(root);
    }

    render(container: ComponentContainer, state: any): void {
        const button = document.createElement('sl-button');
        button.innerText = 'Create Entity';
        // @ts-ignore
        button.size='large';
        container.element.appendChild(button);
        container.element.appendChild(this.tree);

        this.renderTree();

        button.addEventListener('click', (e) => {
            if (this.editor.game.currentScene) {
                const entity = this.editor.game.currentScene.addEntity(`Entity_${this.index}`);
                entity.addComponent(Transform);
                this.editor.game.currentScene!.entityEvents.emit({
                    type: EntityEvents.Create,
                    entity,
                })
                this.index++;
                this.renderTree();
            }
        });
    }
}