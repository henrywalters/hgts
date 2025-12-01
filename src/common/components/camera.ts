import { PerspectiveCamera as Perspective, OrthographicCamera as Orthographic } from "three"
import { Component } from "../../ecs/component";

export class PerspectiveCamera extends Component {
    camera: Perspective = new Perspective();
}

export class OrthographicCamera extends Component {
    camera: Orthographic = new Orthographic();
}