import { Scene } from "../../core/scene";
import { Color } from "three";
import { OrthographicCamera, PerspectiveCamera } from "../../common/components/camera";
import { IGame } from "../../core/interfaces/game";
import { EntityEvents } from "../../core/events";

export class Runtime extends Scene {

    public onInitialize(): void {
        this.scene.background = new Color(0.1, 0.1, 0.5);
    }

    public onResize(width: number, height: number): void {
        this.components.forEach(PerspectiveCamera, (component) => {
            component.aspectRatio = width / height;
            component.update();
            this.game.entityEvents.emit({
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
            this.game.entityEvents.emit({
                type: EntityEvents.Change,
                entity: component.entity,
            })
        })
    }

    public onUpdate(dt: number): void {

    }
}