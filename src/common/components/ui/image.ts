import { DoubleSide, Euler, Float32BufferAttribute, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Vector2 } from "three";
import { Param, String, Types } from "../../../core/reflection";
import { UIRenderableElement } from "./element";
import { Assets } from "../../../core/assets";

export class Image extends UIRenderableElement {

    @String()
    texture: string = '';

    @Param({type: Types.Vector2})
    textureMin: Vector2 = new Vector2();

    @Param({type: Types.Vector2})
    textureMax: Vector2 = new Vector2(1, 1);

    addMeshes(scene: Scene): void {
        const mesh = new Mesh();
        this.meshes.push(mesh);
        this.updateMeshes(scene);
        scene.add(mesh);
    }

    positionMeshes(scene: Scene): void {
        const position = this.entity.position;

        const euler = new Euler();

        euler.set(this.entity.rotation.x, this.entity.rotation.y, this.entity.rotation.z, 'XYZ');
        this.meshes[0].position.copy(position);
        this.meshes[0].rotation.copy(euler);
    }

    updateMeshes(scene: Scene): void {

        const mesh = this.meshes[0];

        if (mesh.geometry) {
            mesh.geometry.dispose();
        }

        mesh.geometry = new PlaneGeometry(this.innerSize.x, this.innerSize.y);

        if (Assets.textures.has(this.texture)) {
                    
            const uvs = new Float32Array([
                this.textureMin.x, this.textureMax.y, // v0 (top-left)
                this.textureMax.x, this.textureMax.y, // v1 (top-right)
                this.textureMin.x, this.textureMin.y, // v2 (bottom-left)
                this.textureMax.x, this.textureMin.y, // v3 (bottom-right)
            ]);
            
            mesh.geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
            mesh.geometry.attributes.uv.needsUpdate = true;

            mesh.material = new MeshBasicMaterial({
                map: Assets.textures.get(this.texture),
                transparent: true,
                side: DoubleSide,
            });
            // this.mesh.material.needsUpdate = true;
        } 

    }
}