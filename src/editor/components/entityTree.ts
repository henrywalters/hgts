import { ComponentContainer } from "golden-layout";
import { IEditorComponent } from "../interfaces/editorComponent";
import { EditorComponent } from "./editorComponent";
import { IEditor } from "../interfaces/editor";
import { EntityEvents, SceneEvents } from "../../core/events";
import { EntityData, IEntity } from "../../ecs/interfaces/entity";
import { Transform } from "../../common/components/transform";

export class EntityTree extends EditorComponent implements IEditorComponent {

    private tree: HTMLDivElement;
    private index: number = 0;
    private expanded: {[id: number]: boolean} = {};

    constructor(editor: IEditor) {
        super(editor);
        this.tree = document.createElement('div');

        for (const [name, scene] of this.editor.game.scenes) {
            scene.entityEvents.listen((e) => {
                if (e.type === EntityEvents.Create) {
                    this.expanded[e.entity.id] = true;
                    console.log(this.expanded);
                    this.renderTree();
                } else if (e.type === EntityEvents.Remove) {
                    delete this.expanded[e.entity.id];
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

    private renderEntityTree(entity: IEntity) {
        const item = document.createElement('sl-tree-item');
        item.setAttribute('draggable', "true");
        item.innerText = entity.name;
        item.id = `Entity_${entity.id}`;
        item.setAttribute('entity-id', entity.id.toString());

        if (!(entity.id in this.expanded)) {
            this.expanded[entity.id] = true;
        }

        if (this.expanded[entity.id]) {
            item.setAttribute('expanded', 'true');
        }

        item.addEventListener('sl-expand', (e) => {
            e.stopPropagation();
            this.expanded[entity.id] = true;
            console.log(this.expanded);
        });

        item.addEventListener('sl-collapse', (e) => {
            e.stopPropagation();
            this.expanded[entity.id] = false;
            console.log(this.expanded);
        });

        item.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            e.dataTransfer?.setData("entity-id", entity.id.toFixed(0));
        })

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
        })

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const entityId = e.dataTransfer?.getData('entity-id');
            if (entityId) {
                console.log(`Adding Entity ${entityId} to ${entity.id}`);
                this.editor.game.currentScene!.changeEntityOwner(parseInt(entityId), entity.id);
                this.renderTree();
            }
        })

        this.tree.parentElement?.addEventListener('drop', (e) => {
            const entityId = e.dataTransfer?.getData('entity-id');
            if (entityId) {
                this.editor.game.currentScene!.changeEntityOwner(parseInt(entityId));
                this.renderTree();
            }
        })

        for (const child of entity.children) {
            item.appendChild(this.renderEntityTree(child));
        }

        return item;
    }

    renderTree() {
        this.tree.innerHTML = '';
        const root = document.createElement('sl-tree');
        if (this.editor.game.currentScene) {
            for (const entity of this.editor.game.currentScene.entities) {
                root.appendChild(this.renderEntityTree(entity));
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

        const addFromPrefab = document.createElement('sl-button');
        addFromPrefab.innerText = 'Add From Prefab';
        addFromPrefab.addEventListener('click', async (e) => {
            // @ts-ignore
            const [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const text = await file.text();
            const data = JSON.parse(text) as EntityData;
            this.editor.game.currentScene!.entityEvents.emit({
                type: EntityEvents.Create,
                entity: this.editor.game.currentScene!.addEntityFromPrefab(data, `Entity_${this.index}`),
            })
        })

        container.element.appendChild(addFromPrefab);

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