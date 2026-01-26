import { Euler, Mesh, OrthographicCamera, Scene, Vector2, Vector3 } from "three";
import { Axes, Buttons } from "../../core/interfaces/input";
import { IScene } from "../../core/interfaces/scene";
import { System } from "../../ecs/system";
import { MeshPrimitive } from "../components/mesh";
import { Button } from "../components/ui/button";
import { ComponentCtr } from "../../ecs/interfaces/component";
import { Container } from "../components/ui/container";
import { getAnchorPosition, UIElement, UIRenderableElement, UIUnit } from "../components/ui/element";
import { EntityEvents } from "../../core/events";
import { TextInput, TextInputEvents } from "../components/ui/textInput";
import { IEntity } from "../../ecs/interfaces/entity";
import { Focusable } from "../components/ui/focusable";
import { clamp } from "three/src/math/MathUtils.js";
import { Text } from "../components/ui/text";

export class UI extends System {

    private meshes: Map<number, Mesh[]> = new Map();

    private uiScene = new Scene();
    private camera = new OrthographicCamera();

    private focused: IEntity | null = null;

    private registered: ComponentCtr<any>[] = [
        Container,
        Button,
        Text,
        TextInput,
        Focusable,
    ]

    constructor(scene: IScene) {
        super(scene);

        for (const type of this.registered) {
            this.scene.components.register(type);
        }

        document.addEventListener('keydown', (e) => {
            if (this.focused) {
                const input = this.focused.getComponent(TextInput);
                if (input) {

                    if (!this.focused.getComponent(Focusable)!.focused) {
                        this.focused = null;
                        return;
                    }

                    if (e.key === 'Backspace') {
                        input.delete();
                        input.events.emit(TextInputEvents.Delete);
                    }

                    if (e.key === 'Enter') {
                        input.events.emit(TextInputEvents.Enter);
                    }

                    const key = e.key;
                    if (/^[a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]$/.test(key)) {
                        input.addChar(e.key);
                        input.events.emit(TextInputEvents.NewCharacter);
                    }
                }
            }
        });

        this.scene.entityEvents.listen((e) => {
            if (!e.component || !(e.component instanceof UIRenderableElement)) return;
            if (e.type === EntityEvents.AddComponent) {
                e.component.addMeshes(this.uiScene);
            } else if (e.type === EntityEvents.UpdateComponent) {
                e.component.updateMeshes(this.uiScene);
            } else if (e.type === EntityEvents.RemoveComponent) {
                e.component.removeMeshes(this.uiScene);
            }
        })
    }

    onBeforeUpdate(): void {

        for (const type of this.registered) {
            this.scene.components.forEach(type, (component) => {
                component.update();
            });
        }

        const size = this.scene.game.getSize();
        this.camera.top = size.y / 2;
        this.camera.bottom = -size.y / 2;
        this.camera.left = -size.x / 2;
        this.camera.right = size.x / 2;
        this.camera.position.z = 100;
        this.camera.updateProjectionMatrix();

        let mousePos = this.scene.game.input.getAxis(Axes.MousePosition);
        const pressed = this.scene.game.input.getButton(Buttons.MouseLeft);
        const justPressed = this.scene.game.input.getButtonPressed(Buttons.MouseLeft);

        mousePos.y = this.camera.top - this.camera.bottom - mousePos.y;

        mousePos.add(new Vector2(this.camera.left, this.camera.bottom));

        if (justPressed) {
            this.focused = null;
            this.scene.components.forEach(Focusable, (focusable) => {
                if (focusable.getAABB().contains(mousePos)) {
                    this.focused = focusable.entity;
                    focusable.focused = true;
                } else {
                    focusable.focused = false;
                }
            })
        }

        this.scene.components.forEach(Button, (button) => {
            const mesh = button.entity.getComponent(Container);
            if (mesh) {
                const aabb = mesh.getAABB();

                if (aabb.contains(mousePos)) {
                    if (mesh.color !== button.hoverColor) {
                        mesh.color = button.hoverColor;
                        mesh.notifyUpdate();
                    }

                    button.isHovering = true;
                    
                } else {
                    if (mesh.color !== button.defaultColor) {
                        mesh.color = button.defaultColor;
                        mesh.notifyUpdate();
                    }

                    button.isHovering = false;
                }
            }

            if (button.isHovering) {
                if (justPressed) {
                    button.isJustReleased = false;
                    button.isJustPressed = true;
                    button.isPressed = true;
                } else if (pressed) {
                    button.isJustPressed = false;
                } else {
                    button.isJustPressed = false;
                    button.isJustReleased = button.isPressed ? true : false;
                    button.isPressed = false;
                }
            } else {
                button.isPressed = false;
                button.isJustPressed = false;
                button.isJustReleased = false;
            }
        });
    }

    onAfterUpdate(): void {
        for (const type of this.registered) {
            this.scene.components.forEach(type, (component) => {
                if (component instanceof UIRenderableElement) {
                    component.positionMeshes(this.uiScene);
                }
            });
        }

        this.scene.game.renderer.render(this.uiScene, this.camera);
    }
}