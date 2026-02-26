import { Color, Mesh, Scene, Vector2, Vector3 } from "three";
import { Array, Float, Param, Types, Boolean } from "../../core/reflection";
import { LineGeometry, LineMaterial } from "three/examples/jsm/Addons.js";
import { Renderable } from "./renderable";

export class Line extends Renderable {

    @Array(Types.Vector3)
    points: Vector3[] = [];

    @Float()
    lineWidth: number = 1;

    @Param({type: Types.Color})
    color: Color = new Color('red');

    @Boolean()
    transparent: boolean = false;

    @Float()
    opacity: number = 1.0;

    public setFromRect(size: Vector2, pos: Vector2 = new Vector2()) {
        this.points = [
            new Vector3(pos.x - size.x / 2, pos.y - size.y / 2, 0),
            new Vector3(pos.x + size.x / 2, pos.y - size.y / 2, 0),
            new Vector3(pos.x + size.x / 2, pos.y + size.y / 2, 0),
            new Vector3(pos.x - size.x / 2, pos.y + size.y / 2, 0),
            new Vector3(pos.x - size.x / 2, pos.y - size.y / 2, 0),
        ]
    }

    updateMeshes(scene: Scene): void {

        if (this.mesh.geometry) {
            this.mesh.geometry.dispose();
        }

        if (this.points.length < 2) return;

        const size = this.entity.scene.game.getSize();

        this.mesh.geometry = new LineGeometry();
        this.mesh.geometry.setFromPoints(this.points);
        this.mesh.material = new LineMaterial({
            linewidth: this.lineWidth,
            color: this.color,
            resolution: size,
            transparent: this.transparent,
            opacity: this.opacity,
        });
    }
}