import { BoxGeometry, Color, Euler, Mesh, MeshBasicMaterial, Scene } from "three";
import { Param, Types } from "../../../core/reflection";
import { UIRenderableElement } from "./element";

export class Container extends UIRenderableElement {
    @Param({type: Types.Color})
    color: Color = new Color();

    addMeshes(scene: Scene): void {
        const mesh = new Mesh();
        mesh.geometry = new BoxGeometry(this.innerSize.x, this.innerSize.y, 1);
        mesh.material = new MeshBasicMaterial({color: this.color});
        this.meshes.push(mesh);
        scene.add(mesh);
    }

    positionMeshes(scene: Scene): void {
        const mesh = this.meshes[0];

        if (!mesh) return;

        const position = this.entity.position;

        const euler = new Euler();

        euler.set(this.entity.rotation.x, this.entity.rotation.y, this.entity.rotation.z, 'XYZ');
        mesh.position.copy(position);
        mesh.rotation.copy(euler);
    }

    updateMeshes(scene: Scene): void {

        const mesh = this.meshes[0];

        if (!mesh) return;

        if (mesh.geometry) {
            mesh.geometry.dispose();
        }

        // if (mesh.material) {
        //     if (Array.isArray(mesh.material)) {
        //         mesh.material.forEach(mat => mat.dispose());
        //     } else {
        //         mesh.material.dispose();
        //     }
        // }

        this.meshes[0].geometry = new BoxGeometry(this.innerSize.x, this.innerSize.y, 1);
        (this.meshes[0].material as MeshBasicMaterial).color.copy(this.color);
    }
}