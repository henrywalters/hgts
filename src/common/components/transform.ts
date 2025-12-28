import { Vector3 } from "three";
import { ITransform } from "../../core/transform";
import { Component } from "../../ecs/component";
import { Param, Types } from "../../core/reflection";

export class Transform extends Component implements ITransform {
    @Param({type: Types.Vector3})
    public position: Vector3 = new Vector3(0, 0, 0);

    @Param({type: Types.Vector3})
    public scale: Vector3 = new Vector3(1, 1, 1);

    @Param({type: Types.Vector3})
    public rotation: Vector3 = new Vector3(0, 0, 0);
}