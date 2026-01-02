import { ComponentContainer } from "golden-layout";
import { IEditorComponent } from "../interfaces/editorComponent";
import { EditorComponent } from "./editorComponent";
import { IEditor } from "../interfaces/editor";
import { IEntity } from "../../ecs/interfaces/entity";
import { makeInput, makeSimpleInput } from "../inputs";
import { Types } from "../../core/reflection";
import { EntityEvents, SceneEvents } from "../../core/events";
import { ScriptRegistry } from "../../core/script";
import { IScene } from "../../core/interfaces/scene";

export class EntityView extends EditorComponent implements IEditorComponent {

    private root: HTMLDivElement;
    private entity: IEntity | null = null;

    constructor(editor: IEditor) {
        super(editor);

        this.root = document.createElement('div');

        for (const [name, scene] of this.editor.game.scenes) {
            scene.entityEvents.listen((e) => {
                if (e.type === EntityEvents.Select || (e.type === EntityEvents.Change && this.entity?.id === e.entity.id)) {
                    this.entity = e.entity;
                    this.renderEntity();
                }
            });
        }

        this.editor.game.sceneEvents.listen((e) => {
            if (e.type === SceneEvents.New) {
                this.entity = null;
                this.renderEntity();
            }
        })
    }

    private createComponentSelector() {
        const root = document.createElement('sl-dropdown');
        const trigger = document.createElement('sl-button');
        trigger.setAttribute('slot', 'trigger');
        trigger.innerText = 'Add Component';
        root.appendChild(trigger);
        const menu = document.createElement('sl-menu');

        for (const component of this.editor.game.currentScene!.components.getComponents()) {
            const item = document.createElement('sl-menu-item');
            item.innerText = component.name;
            menu.appendChild(item);
            item.addEventListener('click', (e) => {
                const newComponent = this.entity?.addComponent(component.ctr);
                this.renderEntity();
            })
        }

        root.appendChild(menu);

        return root;
    }

    private renderEntity() {

        this.root.innerHTML = '';

        if (!this.entity) return;

        const removeBtn = document.createElement('sl-button');
        removeBtn.innerText = 'Remove Entity';
        
        removeBtn.addEventListener('click', (e) => {
            this.editor.game.currentScene!.removeEntity(this.entity!.id);
            this.entity = null;
            this.renderEntity();
        });

        this.root.appendChild(removeBtn);

        const label = document.createElement('h3');
        label.innerText = 'Entity Name';

        this.root.appendChild(this.createComponentSelector());
        
        const nameInput = makeSimpleInput(null, {type: Types.String, description: 'Set the name of the Entity'}, this.entity.name, (value) => {
            if (!this.entity) return;
            this.entity.name = value as string;
        });

        nameInput.addEventListener('blur', () => {
            this.editor.game.currentScene!.entityEvents.emit({
                type: EntityEvents.Change,
                entity: this.entity!,
            })
        })

        this.root.appendChild(label);

        this.root.appendChild(nameInput);

        this.root.appendChild(document.createElement('sl-divider'));

        //this.root.appendChild(this.addWatchedInput('text', 'Entity Name', this.entity, 'name'));

        for (const component of this.entity.getComponents()) {
            const div = document.createElement('div');
            const header = document.createElement('div');
            header.style.display = 'flex';
            
            const removeBtn = document.createElement('sl-icon-button');
            removeBtn.setAttribute('name', 'x-lg');
            removeBtn.setAttribute('label', 'Remove Component');
            header.appendChild(removeBtn);

            removeBtn.addEventListener('click', (e) => {
                this.entity!.removeComponent(component);
                this.renderEntity();
            })
            
            const label = document.createElement('h2');
            label.innerHTML = component.constructor.name;

            header.appendChild(label);

            div.appendChild(header);

            for (const [key, field] of component.getParams()) {
                div.appendChild(makeInput(this.editor.game.currentScene as IScene, component, key, field, (value) => {
                    this.editor.game.currentScene!.entityEvents.emit({
                        type: EntityEvents.UpdateComponent,
                        entity: this.entity!,
                        component: component,
                    })
                }));

                if (field.type === Types.Script) {
                    // @ts-ignore
                    const script = ScriptRegistry.get(component[key] as string, component);
                    if (script) {
                        for (const [scriptKey, scriptField] of script.getParams()) {
                            div.appendChild(makeInput(this.editor.game.currentScene as IScene, script, scriptKey, scriptField, (value) => {
                                this.editor.game.currentScene!.entityEvents.emit({
                                    type: EntityEvents.UpdateComponent,
                                    entity: this.entity!,
                                    component,
                                })
                            }))
                        }
                    }
                }
            }

            this.root.appendChild(div);
        }
    }

    render(container: ComponentContainer, state: any): void {
        container.element.style.overflowY = 'scroll';
        container.element.appendChild(this.root);   
    }
}