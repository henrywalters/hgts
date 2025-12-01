import { Vector3 } from "three";
import { ITransform } from "../../core/transform";
import { Component } from "../../ecs/component";

export class Transform extends Component implements ITransform {   
    public position: Vector3 = new Vector3(0, 0, 0);
    public scale: Vector3 = new Vector3(1, 1, 1);
    public rotation: Vector3 = new Vector3(0, 0, 0);
}