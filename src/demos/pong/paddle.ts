import { Vector2 } from "three";
import { MeshPrimitive } from "../../common/components/mesh";
import { Param, Types } from "../../core/reflection";
import { Script } from "../../core/script";

export abstract class Paddle extends Script {
    @Param({type: Types.Float})
    speed: number = 100;

    @Param({type: Types.Float})
    padding: number = 50;

    @Param({type: Types.Boolean})
    computer: boolean = false;

    protected mesh() {
        return this.entity.getComponent(MeshPrimitive);
    }

    protected abstract getNewY(dt: number): number;

    onUpdate(dt: number): void {

        this.entity.transform.position.setX(this.computer ? this.gameSize.x / 2 - this.padding : -this.gameSize.x / 2 + this.padding);

        this.entity.transform.position.setY(this.getNewY(dt));
    }
}