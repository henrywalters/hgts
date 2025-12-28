import { clamp } from "three/src/math/MathUtils.js";
import { Param, Types } from "../../core/reflection";
import { Script } from "../../core/script";
import { Paddle } from "./paddle";

export class ComputerPaddle extends Paddle {

    @Param({type: Types.Entity})
    ball: number = -1;

    protected getNewY(dt: number): number {
        const ball = this.entity.scene.getEntity(this.ball);
        if (!ball) return 0;
        
        const mesh = this.mesh();
        const size = this.gameSize;

        let newPos = this.entity.transform.position.y + Math.sign(ball.transform.position.y - this.entity.transform.position.y) * this.speed * dt

        if (mesh) {
            newPos = clamp(newPos, -size.y / 2 + mesh.height / 2, size.y / 2 - mesh.height / 2);
        }

        return newPos;
    }
}