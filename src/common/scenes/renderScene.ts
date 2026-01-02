import { EntityEvents } from "../../core/events";
import { Scene } from "../../core/scene";
import { OrthographicCamera, PerspectiveCamera } from "../components/camera";

export class RenderScene extends Scene {
    public onResize(width: number, height: number): void {
        this.components.forEach(PerspectiveCamera, (component) => {
            component.aspectRatio = width / height;
            component.update();
            this.entityEvents.emit({
                type: EntityEvents.Change,
                entity: component.entity,
            })
        });

        this.components.forEach(OrthographicCamera, (component) => {
            component.left = -width / 2;
            component.right = width / 2;
            component.top = height / 2;
            component.bottom = -height / 2;
            component.update();
            this.entityEvents.emit({
                type: EntityEvents.Change,
                entity: component.entity,
            })
        })
    }
}