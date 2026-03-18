import { Assets } from "../../core/assets";
import { System } from "../../ecs/system";
import { MeshPrimitive } from "../components/mesh";
import { SpriteSheet } from "../components/spriteSheet";
import { Image } from "../components/ui/image";

export class SpriteSheetSystem extends System {
    onUpdate(dt: number): void {
            this.scene.components.forEach(SpriteSheet, (ss) => {
    
                if (!Assets.spriteSheets.has(ss.spriteSheet)) return;
    
                const sheet = Assets.spriteSheets.get(ss.spriteSheet);
    
                if (ss.animated) {
                    ss.timeSinceTick += dt;
                    if (ss.animationSpeed === 0) return;
                    const tickRate = ss.animationSpeed / (sheet.cells.x * sheet.cells.y);
                    while (ss.timeSinceTick > tickRate) {
                        ss.index = ss.reverse ? ss.index - 1 : ss.index + 1;
                        ss.timeSinceTick -= tickRate;
                    }
                }
    
                if (ss.finished) {
                    ss.onFinish();
                    ss.reset();
                }

                if (ss.index < 0) {
                    ss.index = sheet.cells.x * sheet.cells.y - 1;
                }

                ss.index = ss.index % (sheet.cells.x * sheet.cells.y);
                const uv = sheet.getCell(sheet.getCellPos(ss.index));
    
                let image: MeshPrimitive | Image | void = ss.entity.getComponent(MeshPrimitive);
    
                if (!image) {
                    image = ss.entity.getComponent(Image);
                };

                if (!image) return;

                image.texture = ss.spriteSheet;
                image.textureMin = uv.min;
                image.textureMax = uv.max;
    
                image.notifyUpdate();
            })
    }
}