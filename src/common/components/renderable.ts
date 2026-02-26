import { Mesh, Scene } from "three";
import { Component } from "../../ecs/component";
import { AABB } from "../../utils/math";

export abstract class Renderable extends Component {

    public meshes: Mesh[] = [];

    protected get mesh() {
        return this.meshes[0];
    }

    addMeshes(scene: Scene): void {
        this.meshes.push(new Mesh());
        this.updateMeshes(scene);
    }

    abstract updateMeshes(scene: Scene): void;

    removeMeshes(scene: Scene) {
        for (const mesh of this.meshes) {
            mesh.geometry.dispose();
            scene.remove(mesh);

            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(mat => mat.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        }
        this.meshes = [];
    }
}