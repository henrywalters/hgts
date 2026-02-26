import { Vector2 } from "three";
import { Param, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";
import { AABB } from "../../utils/math";

export class Collider extends Component {

}

export class BoxCollider2D extends Collider {
    @Param({type: Types.Vector2})
    min: Vector2 = new Vector2();

    @Param({type: Types.Vector2})
    max: Vector2 = new Vector2();

    getAABB() {
        const pos = this.entity.position;
        const pos2D = new Vector2(pos.x, pos.y);
        return new AABB(pos2D.clone().add(this.min), pos2D.clone().add(this.max));
    }
}