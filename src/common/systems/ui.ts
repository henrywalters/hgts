import { Vector2 } from "three";
import { Axes, Buttons } from "../../core/interfaces/input";
import { IScene } from "../../core/interfaces/scene";
import { System } from "../../ecs/system";
import { OrthographicCamera } from "../components/camera";
import { MeshPrimitive } from "../components/mesh";
import { Button } from "../components/ui/button";

export class UI extends System {

    constructor(scene: IScene) {
        super(scene);

        this.scene.components.register(Button);
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