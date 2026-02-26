import { Euler, Matrix4, Vector3 } from "three";
import { System } from "../../ecs/system";
import { FreeCamera } from "../components/freeCamera";
import { Axes, Buttons } from "../../core/interfaces/input";
import { clamp } from "three/src/math/MathUtils.js";
import { CameraPan, CameraZoom, OrthographicCamera, PerspectiveCamera } from "../components/camera";
import { EntityEvents } from "../../core/events";
import { IScene } from "../../core/interfaces/scene";

export class CameraControllers extends System {

    constructor(scene: IScene) {
        super(scene);
        this.scene.components.register(FreeCamera);
        this.scene.components.register(CameraPan);
        this.scene.components.register(CameraZoom);
    }

    public onUpdate(dt: number): void {

        this.scene.components.forEach(CameraPan, (pan) => {
            const direction = this.scene.game.input.getAxis(Axes.KeyboardWASD);
            const movement = new Vector3()
                .add(pan.right.clone().multiplyScalar(pan.speed * direction.x * dt))
                .add(pan.up.clone().multiplyScalar(pan.speed * direction.y * dt));
            pan.entity.transform.position.add(movement);
        });

        this.scene.components.forEach(CameraZoom, (zoom) => {
            const scroll = this.scene.game.input.getAxis(Axes.MouseWheel).y;
            let camera = zoom.entity.getComponent(OrthographicCamera);
            if (!camera) {
                camera = zoom.entity.getComponentInChildren(OrthographicCamera); 
            }
            if (!camera) {
                console.error("CameraZoom must have OrthographicCamera in entity or child");
                return;
            }
            camera.zoom = clamp(camera.zoom - scroll * dt * zoom.speed, zoom.minZoom, zoom.maxZoom);
            camera.notifyUpdate();
        })

        this.scene.components.forEach(FreeCamera, (controller) => {

            const delta = this.scene.game.input.getAxis(Axes.MouseDelta);
            const camera = controller.entity.getComponent(PerspectiveCamera);
            const direction = this.scene.game.input.getAxis(Axes.KeyboardWASD);
            const arrowDir = this.scene.game.input.getAxis(Axes.KeyboardDirectional);

            if (!camera) return;

            if (this.scene.game.input.getButton(Buttons.MouseRight)) {

                controller.yaw -= delta.x * controller.lookSpeed * dt;
                controller.pitch -= delta.y * controller.lookSpeed * dt;

                controller.pitch = clamp(controller.pitch, -Math.PI, Math.PI);

                controller.entity.transform.rotation.setX(controller.pitch);
                controller.entity.transform.rotation.setY(controller.yaw);

                const localDir = new Vector3(direction.x, 0, -direction.y);
                localDir.applyQuaternion(camera.camera.quaternion);

                controller.entity.transform.position.addScaledVector(localDir, controller.speed * dt);

                this.scene.entityEvents.emit({
                    type: EntityEvents.Change,
                    entity: controller.entity,
                });
            }

            if (arrowDir.x != 0 || arrowDir.y != 0) {

                const localDir = new Vector3(arrowDir.x, 0, -arrowDir.y);
                localDir.applyQuaternion(camera.camera.quaternion);

                controller.entity.transform.position.addScaledVector(localDir, controller.speed * dt);

                this.scene.entityEvents.emit({
                    type: EntityEvents.Change,
                    entity: controller.entity,
                });
            }

        }); 
    }
}