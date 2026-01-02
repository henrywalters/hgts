import { Vector3 } from "three";
import { Param, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";

export class Smooth extends Component {
    @Param({type: Types.Float})
    speed: number = 1;

    targetPosition: Vector3 = new Vector3();
}