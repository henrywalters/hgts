import { Vector2, Vector3 } from "three";
import { Axes, Buttons } from "../../core/interfaces/input";
import { IScene } from "../../core/interfaces/scene";
import { System } from "../../ecs/system";
import { OrthographicCamera } from "../components/camera";
import { MeshPrimitive } from "../components/mesh";
import { Button } from "../components/ui/button";
import { ComponentCtr } from "../../ecs/interfaces/component";
import { Container } from "../components/ui/container";
import { getAnchorPosition, UIElement } from "../components/ui/element";
import { EntityEvents } from "../../core/events";

export class UI extends System {

    private registered: ComponentCtr<any>[] = [
        Container,
        Button,
    ]

    constructor(scene: IScene) {
        super(scene);

        for (const type of this.registered) {
            this.scene.components.register(type);
        }
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
                if (component instanceof UIElement) {

                    const mesh = component.entity.getComponent(MeshPrimitive);
                    if (mesh) {
                        mesh.width = component.size.x;
                        mesh.height = component.size.y;
                        this.scene.entityEvents.emit({
                            type: EntityEvents.UpdateComponent,
                            entity: component.entity,
                            component: mesh,
                        })
                    }

                    if (component.anchored) {
                        const parentSize = new Vector2();
                        const parentPos = new Vector2();
                        this.scene.game.renderer.getSize(parentSize);

                        if (component.entity.parent) {
                            for (const other of this.registered) {
                                const comp = component.entity.parent.getComponent(other);
                                if (comp && comp instanceof UIElement) {
                                    parentSize.copy(comp.size);
                                    parentPos.x = comp.entity.position.x;
                                    parentPos.y = comp.entity.position.y;
                                }
                            }
                        }
                        const pos = getAnchorPosition(component.size, parentSize, component.anchorAlignment);
                        // console.log(component.size, parentSize, pos);
                        component.entity.transform.position.x = pos.x;
                        component.entity.transform.position.y = pos.y;

                        // console.log(parentSize);
                    }
                }
            });
        }

        let mousePos = this.scene.game.input.getAxis(Axes.MousePosition);
        const camera = this.findCamera();
        const pressed = this.scene.game.input.getButton(Buttons.MouseLeft);
        const justPressed = this.scene.game.input.getButtonPressed(Buttons.MouseLeft);

        if (!camera) return;

        mousePos.y = camera.top - camera.bottom - mousePos.y;

        mousePos.add(new Vector2(camera.left, camera.bottom));

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
}