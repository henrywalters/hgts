import { Vector2 } from "three";
import { Param, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";

export class PongBall extends Component {
    @Param({type: Types.Float})
    speed: number = 100;

    @Param({type: Types.Vector2})
    direction: Vector2 = new Vector2();

    @Param({type: Types.Float})
    currentSpeed: number = this.speed;
}