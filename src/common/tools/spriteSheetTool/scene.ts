import { Assets } from "../../../core/assets";
import { RenderScene } from "../../scenes/renderScene";

export class SpriteSheetTool extends RenderScene {
    public async setSprite(url: string) {
        return await Assets.loadTexture({
            name: "sprite",
            url,
        });   
    }
}