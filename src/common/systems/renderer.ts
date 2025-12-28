import { BoxGeometry, Euler, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, OrthographicCamera as Orthographic, PlaneGeometry, SphereGeometry, Scene as ThreeScene } from "three";
import { IScene } from "../../core/interfaces/scene";
import { System } from "../../ecs/system";
import { OrthographicCamera, PerspectiveCamera } from "../components/camera";
import { MeshComponent, MeshPrimitive, MeshPrimitiveType } from "../components/mesh";
import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";
import { EntityEvents } from "../../core/events";
import { BasicMaterial } from "../components/material";

export class Renderer extends System {

    private updateMesh(mesh: MeshPrimitive) {
        if (mesh.type === MeshPrimitiveType.Cube) {
            mesh.mesh.geometry = new BoxGeometry(mesh.width, mesh.height, mesh.depth);
        } else if (mesh.type === MeshPrimitiveType.Plane) {
            mesh.mesh.geometry = new PlaneGeometry(mesh.width, mesh.height);
        } else if (mesh.type === MeshPrimitiveType.Sphere) {
            mesh.mesh.geometry = new SphereGeometry(mesh.radius);
        } else {
            throw new Error(`Unsupported Mesh Primtiive ${mesh.type}`);
        }

        mesh.mesh.material = new MeshBasicMaterial({color: mesh.color});
    }

    constructor(scene: IScene) {
        super(scene);
        this.scene.components.register(PerspectiveCamera);
        this.scene.components.register(OrthographicCamera);
        this.scene.components.register(MeshComponent);

        this.scene.game.entityEvents.listen((e) => {
            if (e.type === EntityEvents.AddComponent) {
                if (e.component! instanceof MeshPrimitive) {
                    this.updateMesh(e.component);
                    this.scene.scene.add(e.component.mesh);
                }
            } else if (e.type === EntityEvents.UpdateComponent) {
                if (e.component! instanceof MeshPrimitive) {
                    this.updateMesh(e.component);
                }
            } else if (e.type === EntityEvents.RemoveComponent) {
                if (e.component! instanceof MeshPrimitive) {
                    this.scene.scene.remove(e.component.mesh);
                }
            }
        });
    }

    private findCamera(): PerspectiveCamera | OrthographicCamera | null {

        let camera: PerspectiveCamera | OrthographicCamera | null = null;

        this.scene.components.forEach(PerspectiveCamera, (cam) => {
            if (camera !== null) {
                console.warn("Only one camera is used at once");
                return;
            }
            camera = cam;
        });

        this.scene.components.forEach(OrthographicCamera, (cam) => {
            if (camera !== null) {
                console.warn("Only one camera is used at once");
                return;
            }
            camera = cam;
        });

        return camera;
    }

    onAfterUpdate(): void {

        const camera = this.findCamera();

        if (camera === null) {
            return;
        }

        camera.camera.position.copy(camera.entity.transform.position);
        camera.camera.quaternion.setFromEuler(new Euler(camera.entity.transform.rotation.x, camera.entity.transform.rotation.y, camera.entity.transform.rotation.z, 'YXZ'))

        let euler = new Euler();

        this.scene.components.forEach(MeshPrimitive, (mesh) => {
            let transform = mesh.entity.transform;
            euler.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, 'XYZ');
            mesh.mesh.position.copy(transform.position);
            mesh.mesh.rotation.copy(euler);
        });

        this.scene.game.renderer.render(this.scene.scene, camera.camera);
    }
}