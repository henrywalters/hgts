import { Vector3 } from "three";
import { ITransform } from "../../core/transform";
import { Component } from "../../ecs/component";
import { Entity } from "../../ecs/entity";

export class Transform extends Component{
    public transform: ITransform;

    constructor(entity: Entity) {
        super(entity);
        this.transform = {
            position: new Vector3(0, 0, 0),
            scale: new Vector3(1, 1, 1),
            rotation: new Vector3(0, 0, 0)
        }
    }
}