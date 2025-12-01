import { Mesh } from "three";
import { Component } from "../../ecs/component";

export class MeshComponent extends Component {
    mesh: Mesh = new Mesh();
}
