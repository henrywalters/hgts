import { Color } from "three";
import { RenderScene } from "../../common/scenes/renderScene";

export class Runtime extends RenderScene {

    public onInitialize(): void {
        this.scene.background = new Color(0.1, 0.1, 0.5);
    }

    public onUpdate(dt: number): void {

    }
}