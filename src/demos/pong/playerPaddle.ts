import { Vector2, Vector3 } from "three";
import { Axes } from "../../core/interfaces/input";
import { Script } from "../../core/script";
import { MeshPrimitive } from "../../common/components/mesh";
import { clamp } from "three/src/math/MathUtils.js";
import { Paddle } from "./paddle";

export class PlayerPaddle extends Paddle {

    protected getNewY(dt: number): number {
        const direction = this.entity.scene.game.input.getAxis(Axes.KeyboardWASD);
        const mesh = this.mesh();
        const size = this.gameSize;

        let newPos = this.entity.transform.position.y + direction.y * this.speed * dt

        if (mesh) {
            newPos = clamp(newPos, -size.y / 2 + mesh.height / 2, size.y / 2 - mesh.height / 2);
        }

        return newPos;
    }
}