import { BoxGeometry, Euler, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, OrthographicCamera as Orthographic, PlaneGeometry, SphereGeometry, Scene as ThreeScene, Vector3 } from "three";
import { IScene } from "../../core/interfaces/scene";
import { System } from "../../ecs/system";
import { OrthographicCamera, PerspectiveCamera } from "../components/camera";
import { MeshComponent, MeshPrimitive, TextMesh } from "../components/mesh";
import { EntityEvents } from "../../core/events";
import { ComponentCtr } from "../../ecs/interfaces/component";
import { Smooth } from "../components/smooth";

export class Renderer extends System {

    private meshes: Map<number, Mesh> = new Map();

    private managedComponents: ComponentCtr<any>[] = [
        MeshPrimitive,
        TextMesh,
    ];

    constructor(scene: IScene) {

        console.log("CREATING RENDERER");

        super(scene);
        this.scene.components.register(PerspectiveCamera);
        this.scene.components.register(OrthographicCamera);
        this.scene.components.register(Smooth);

        for (const component of this.managedComponents) {
            this.scene.components.register(component);
        }

        this.scene.entityEvents.listen((e) => {
            if (e.type === EntityEvents.AddComponent) {
                if (e.component! instanceof MeshComponent) {
                    const mesh = new Mesh();
                    this.meshes.set(e.component.id, mesh);
                    e.component.updateMesh(mesh);
                    this.scene.scene.add(mesh);
                }
            } else if (e.type === EntityEvents.UpdateComponent) {
                if (e.component! instanceof MeshComponent) {
                    e.component.updateMesh(this.meshes.get(e.component.id)!);
                }
            } else if (e.type === EntityEvents.RemoveComponent) {
                if (e.component! instanceof MeshComponent) {
                    this.scene.scene.remove(this.meshes.get(e.component.id)!);
                }
            }

            if (e.type === EntityEvents.Remove) {
                for (const type of this.managedComponents) {
                    const component = e.entity.getComponent<MeshComponent>(type);
                    if (component && this.meshes.has(component.id)) {
                        this.scene.scene.remove(this.meshes.get(component.id)!);
                    }
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

    onUpdate(dt: number): void {
        this.scene.components.forEach(Smooth, (smooth) => {
            const delta = new Vector3();
            delta.subVectors(smooth.targetPosition, smooth.entity.transform.position);
            const mag = delta.length();
            delta.normalize();

            const change = delta.clone().multiplyScalar(dt * smooth.speed);

            if (mag <= 0.001) {
                smooth.targetPosition = smooth.entity.transform.position;
            } else if (mag < change.length()) {
                smooth.entity.transform.position.add(delta.clone().multiplyScalar(mag));
            } else {
                smooth.entity.transform.position.add(change);
            }
        })
    }

    onAfterUpdate(): void {

        const camera = this.findCamera();

        if (camera === null) {
            return;
        }

        camera.camera.position.copy(camera.entity.transform.position);
        camera.camera.quaternion.setFromEuler(new Euler(camera.entity.transform.rotation.x, camera.entity.transform.rotation.y, camera.entity.transform.rotation.z, 'YXZ'))

        let euler = new Euler();

        for (const type of this.managedComponents) {
            this.scene.components.forEach(type, (component) => {
                let transform = component.entity.transform;
                euler.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, 'XYZ');
                const mesh = this.meshes.get(component.id)!;
                mesh.position.copy(transform.position);
                mesh.rotation.copy(euler);
            });
        }



        this.scene.game.renderer.render(this.scene.scene, camera.camera);
    }
}