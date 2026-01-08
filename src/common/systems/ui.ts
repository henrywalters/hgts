import { Euler, Mesh, Vector2, Vector3 } from "three";
import { Axes, Buttons } from "../../core/interfaces/input";
import { IScene } from "../../core/interfaces/scene";
import { System } from "../../ecs/system";
import { OrthographicCamera } from "../components/camera";
import { MeshPrimitive } from "../components/mesh";
import { Button } from "../components/ui/button";
import { ComponentCtr } from "../../ecs/interfaces/component";
import { Container } from "../components/ui/container";
import { getAnchorPosition, UIElement, UIRenderableElement, UIUnit } from "../components/ui/element";
import { EntityEvents } from "../../core/events";
import { TextInput } from "../components/ui/textInput";
import { IEntity } from "../../ecs/interfaces/entity";
import { Focusable } from "../components/ui/focusable";
import { clamp } from "three/src/math/MathUtils.js";
import { Text } from "../components/ui/text";

export class UI extends System {

    private meshes: Map<number, Mesh[]> = new Map();

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

        document.addEventListener('keyup', (e) => {
            if (this.focused) {
                const input = this.focused.getComponent(TextInput);
                if (input) {
                    const key = e.key;
                    if (/^[a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]$/.test(key)) {
                        input.addChar(e.key);
                        console.log(input.text);
                    }
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.focused) {
                const input = this.focused.getComponent(TextInput);
                if (input) {
                    console.log(e.key, e.key === 'Backspace');
                    if (e.key === 'Backspace') {
                        input.delete();
                    }
                }
            }
        });

        this.scene.entityEvents.listen((e) => {
            if (!e.component || !(e.component instanceof UIRenderableElement)) return;

            if (e.type === EntityEvents.AddComponent) {
                e.component.addMeshes();
            } else if (e.type === EntityEvents.UpdateComponent) {
                e.component.updateMeshes();
            } else if (e.type === EntityEvents.RemoveComponent) {
                e.component.removeMeshes();
            }
        })
    }

    private findCamera(): OrthographicCamera | null {
    
            let camera: OrthographicCamera | null = null;
    
            this.scene.components.forEach(OrthographicCamera, (cam) => {
                if (camera !== null) {
                    console.warn("Only one camera is used at once");
                    return;
                }
                camera = cam;
            });
    
            return camera;
        }

    onBeforeUpdate(): void {

        for (const type of this.registered) {
            this.scene.components.forEach(type, (component) => {
                component.update();
            });
        }

        let mousePos = this.scene.game.input.getAxis(Axes.MousePosition);
        const camera = this.findCamera();
        const pressed = this.scene.game.input.getButton(Buttons.MouseLeft);
        const justPressed = this.scene.game.input.getButtonPressed(Buttons.MouseLeft);

        if (!camera) return;

        mousePos.y = camera.top - camera.bottom - mousePos.y;

        mousePos.add(new Vector2(camera.left, camera.bottom));

        if (justPressed) {
            this.focused = null;
            this.scene.components.forEach(Focusable, (focusable) => {
                console.log(focusable.getAABB());
                if (focusable.getAABB().contains(mousePos)) {
                    this.focused = focusable.entity;
                    console.log(focusable);
                }
            })
        }

        this.scene.components.forEach(Button, (button) => {
            const mesh = button.entity.getComponent(MeshPrimitive);
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
                    component.positionMeshes();
                }
            });
        }
    }
}