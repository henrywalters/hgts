import { PerspectiveCamera as Perspective, OrthographicCamera as Orthographic, Camera } from "three"
import { Component } from "../../ecs/component";
import { Param, Types } from "../../core/reflection";
import { IComponent } from "../../ecs/interfaces/component";

export interface ICameraComponent {
    camera: Camera;
}

export class PerspectiveCamera extends Component implements ICameraComponent, IComponent {
    camera: Perspective = new Perspective();

    @Param({type: Types.Float})
    fov: number = 60;

    @Param({type: Types.Float})
    near: number = 0.01;

    @Param({type: Types.Float})
    far: number = 1000;

    @Param({type: Types.Float})
    aspectRatio: number = 1.0;

    update() {
        this.camera.fov = this.fov;
        this.camera.far = this.far;
        this.camera.near = this.near;
        this.camera.aspect = this.aspectRatio;
        this.camera.updateProjectionMatrix();
    }
}

export class OrthographicCamera extends Component implements ICameraComponent {
    camera: Orthographic = new Orthographic();

    @Param({type: Types.Float})
    left: number = -100;

    @Param({type: Types.Float})
    right: number = 100;

    @Param({type: Types.Float})
    bottom: number = -100;

    @Param({type: Types.Float})
    top: number = 100;

    @Param({type: Types.Float})
    near: number = 0.01;

    @Param({type: Types.Float})
    far: number = 1000;

    @Param({type: Types.Float})
    zoom: number = 1;

    update() {
        this.camera.far = this.far;
        this.camera.near = this.near;
        this.camera.left = this.left / this.zoom;
        this.camera.right = this.right / this.zoom;
        this.camera.top = this.top / this.zoom;
        this.camera.bottom = this.bottom / this.zoom;
        this.camera.updateProjectionMatrix();
    }
}