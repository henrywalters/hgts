import { Vector2 } from "three";
import { Param, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";
import { IEntity } from "../../ecs/interfaces/entity";

export class FreeCamera extends Component {
    @Param({type: Types.Float, label: "Move Speed"})
    speed: number = 20.0;

    @Param({type: Types.Float})
    lookSpeed: number = 1.0;

    @Param({type: Types.Boolean})
    canLook: boolean = false;

    pitch: number = 0.0;

    yaw: number = 0.0;
}