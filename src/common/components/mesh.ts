import { Material, Mesh, Vector2 } from "three";
import { Component } from "../../ecs/component";
import { Param, Types } from "../../core/reflection";

export class MeshComponent extends Component {
    mesh: Mesh = new Mesh();
}

export enum MeshPrimitiveType {
    Cube = 'Cube',
    Sphere = 'Sphere',
    Plane = 'Plane'
};

export class MeshPrimitive extends MeshComponent {
    @Param({type: Types.Enum, enum: MeshPrimitiveType})
    type: MeshPrimitiveType = MeshPrimitiveType.Cube;

    @Param({type: Types.Float})
    width: number = 1;

    @Param({type: Types.Float})
    height: number = 1;

    @Param({type: Types.Float})
    depth: number = 1;

    @Param({type: Types.Float})
    radius: number = 1;

    @Param({type: Types.Color})
    color: string = 'black';
}