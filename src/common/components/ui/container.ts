import { BoxGeometry, Color, Euler, Mesh, MeshBasicMaterial } from "three";
import { Param, Types } from "../../../core/reflection";
import { UIRenderableElement } from "./element";

export class Container extends UIRenderableElement {
    @Param({type: Types.Color})
    color: Color = new Color();

    addMeshes(): void {
        const mesh = new Mesh();
        mesh.geometry = new BoxGeometry(this.innerSize.x, this.innerSize.y, 1);
        mesh.material = new MeshBasicMaterial({color: this.color});
        this.meshes.push(mesh);
        this.entity.scene.scene.add(mesh);
    }

    positionMeshes(): void {
        const position = this.entity.position;

        const euler = new Euler();

        euler.set(this.entity.rotation.x, this.entity.rotation.y, this.entity.rotation.z, 'XYZ');
        this.meshes[0].position.copy(position);
        this.meshes[0].rotation.copy(euler);
    }

    updateMeshes(): void {
        this.meshes[0].geometry = new BoxGeometry(this.innerSize.x, this.innerSize.y, 1);
        this.meshes[0].material = new MeshBasicMaterial({color: this.color});
    }
}