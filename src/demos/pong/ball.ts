import { Box3, Ray, Vector2, Vector3 } from "three";
import { MeshPrimitive } from "../../common/components/mesh";
import { Param, Types } from "../../core/reflection";
import { Script } from "../../core/script";
import { IAABB, sweepAABB } from "../../utils/math";
import { IEntity } from "../../ecs/interfaces/entity";

export class Ball extends Script {

    @Param({type: Types.Float})
    startSpeed: number = 300;

    @Param({type: Types.Float})
    speedUp: number = 1.1;

    @Param({type: Types.Entity})
    player: number = -1;

    @Param({type: Types.Entity})
    computer: number = -1;

    speed: number = this.startSpeed;

    direction: Vector3 = new Vector3(0, 0, 0);

    launch(direction: number = -1) {
        const size = this.gameSize;
        const y = Math.random() * size.y - size.y / 2;
        this.direction.setX(size.x / 2 * direction);
        this.direction.setY(y);
        this.direction.normalize();
        this.speed = this.startSpeed;

        this.entity.transform.position = new Vector3(0, 0, 0);
    }



    onUpdate(dt: number): void {

        if (this.direction.x === 0 && this.direction.y === 0) {
            this.launch();
        }

        const mesh = this.entity.getComponent(MeshPrimitive);
        const size = this.gameSize;

        const player = this.entity.scene.getEntity(this.player);
        const computer = this.entity.scene.getEntity(this.computer);

        if (!mesh || !player || !computer) return;

        const playerMesh = player.getComponent(MeshPrimitive);
        const computerMesh = player.getComponent(MeshPrimitive);

        if (!playerMesh || !computerMesh) return;

        const dir: Vector3 = new Vector3();
        dir.copy(this.direction);
        dir.multiplyScalar(this.speed * dt);

        const left: IAABB = {
            min: new Vector2(-size.x / 2 - mesh.radius, -size.y / 2),
            max: new Vector2(-size.x / 2 + mesh.radius, size.y / 2)
        };

        const right: IAABB = {
            min: new Vector2(size.x / 2 - mesh.radius, -size.y / 2),
            max: new Vector2(size.x / 2 + mesh.radius, size.y / 2)
        };

        const top: IAABB = {
            min: new Vector2(-size.x / 2, -size.y / 2 - mesh.radius),
            max: new Vector2(size.x / 2, -size.y / 2 + mesh.radius)
        };

        const bot: IAABB = {
            min: new Vector2(-size.x / 2, size.y / 2 - mesh.radius),
            max: new Vector2(size.x / 2, size.y / 2 + mesh.radius)
        };

        const getRect = (entity: IEntity, rect: MeshPrimitive): IAABB => {
            return {
                min: new Vector2(entity.transform.position.x - rect.width / 2 - rect.radius, entity.transform.position.y - rect.height / 2 - rect.radius),
                max: new Vector2(entity.transform.position.x + rect.width / 2 + rect.radius, entity.transform.position.y + rect.height / 2 + rect.radius),
            };
        }

        const playerRect = getRect(player, playerMesh);
        const computerRect = getRect(computer, computerMesh);

        const reflectX = () => {
            this.direction.setX(this.direction.x * -1);
            this.speed *= this.speedUp;
        };

        const reflectY = () => {
            this.direction.setY(this.direction.y * -1);
            this.speed *= this.speedUp;
        }

        const currentPos = new Vector2(this.entity.transform.position.x, this.entity.transform.position.y);
        const newPos = new Vector2(currentPos.x + dir.x, currentPos.y + dir.y);

        const leftHit = sweepAABB(currentPos, newPos, left);
        const rightHit = sweepAABB(currentPos, newPos, right);
        const topHit = sweepAABB(currentPos, newPos, top);
        const botHit = sweepAABB(currentPos, newPos, bot);

        const playerHit = sweepAABB(currentPos, newPos, playerRect);
        const computerHit = sweepAABB(currentPos, newPos, computerRect);

        if (leftHit) {
            this.launch(1);
        } else if (rightHit) {
            this.launch(-1);
        } else if (topHit) {
            this.entity.transform.position.lerp(new Vector3(newPos.x, newPos.y, 0), topHit);
            reflectY();
        } else if (botHit) {
            this.entity.transform.position.lerp(new Vector3(newPos.x, newPos.y, 0), botHit);
            reflectY();
        } else if (playerHit) {
            this.entity.transform.position.lerp(new Vector3(newPos.x, newPos.y, 0), playerHit);
            reflectX();
        } else if (computerHit) {
            this.entity.transform.position.lerp(new Vector3(newPos.x, newPos.y, 0), computerHit);
            reflectX();
        }  else {
            this.entity.transform.position.add(dir);
        }
    }
}