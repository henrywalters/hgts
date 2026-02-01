import { BoxGeometry, Color, Euler, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, OrthographicCamera as Orthographic, PlaneGeometry, SphereGeometry, Scene as ThreeScene, Vector3 } from "three";
import { IScene } from "../../core/interfaces/scene";
import { System } from "../../ecs/system";
import { OrthographicCamera, PerspectiveCamera } from "../components/camera";
import { MeshPrimitive, TextMesh } from "../components/mesh";
import { EntityEvents } from "../../core/events";
import { ComponentCtr } from "../../ecs/interfaces/component";
import { Smooth } from "../components/smooth";
import { TextHAlignment } from "../components/ui/alignment";
import { Line } from "../components/line";
import { SpriteSheet } from "../components/spriteSheet";
import { DEG2RAD } from "three/src/math/MathUtils.js";
import { Assets } from "../../core/assets";
import { Renderable } from "../components/renderable";
import { GridDisplay } from "../components/grid";
import { Tilemap } from "../components/tilemap";

export class Renderer extends System {

    private managedComponents: ComponentCtr<any>[] = [
        MeshPrimitive,
        TextMesh,
        Line,
        SpriteSheet,
        GridDisplay,
        Tilemap,
    ];

    constructor(scene: IScene) {
        super(scene);
        this.scene.components.register(PerspectiveCamera);
        this.scene.components.register(OrthographicCamera);
        this.scene.components.register(Smooth);

        for (const component of this.managedComponents) {
            this.scene.components.register(component);
        }

        this.scene.entityEvents.listen((e) => {

            if (e.type === EntityEvents.Remove) {
                for (const type of this.managedComponents) {
                    const component = e.entity.getComponent<Renderable>(type);
                    if (component) {
                        component.removeMeshes(this.scene.scene);
                    }
                }
            }

            if (!e.component || !(e.component instanceof Renderable)) return;

            if (e.type === EntityEvents.AddComponent) {
                e.component.addMeshes(this.scene.scene);
                for (const mesh of e.component.meshes) {
                    this.scene.scene.add(mesh);
                }
            } else if (e.type === EntityEvents.UpdateComponent) {
                e.component.updateMeshes(this.scene.scene);
            } else if (e.type === EntityEvents.RemoveComponent) {
                e.component.removeMeshes(this.scene.scene);
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
            cam.camera.lookAt(new Vector3(0, 0, 0));
            camera = cam;
        });

        return camera;
    }

    onUpdate(dt: number): void {

        this.scene.components.forEach(SpriteSheet, (ss) => {

            if (!Assets.spriteSheets.has(ss.spriteSheet)) return;

            const sheet = Assets.spriteSheets.get(ss.spriteSheet);

            const mesh = ss.entity.getComponent(MeshPrimitive);

            if (!mesh) return;

            if (ss.animated) {
                ss.timeSinceTick += dt;
                const tickRate = ss.animationSpeed / (sheet.cells.x * sheet.cells.y);
                while (ss.timeSinceTick > tickRate) {
                    ss.index++;
                    ss.timeSinceTick -= tickRate;
                }
            }

            const index = ss.index % (sheet.cells.x * sheet.cells.y);
            const uv = sheet.getCell(sheet.getCellPos(index));

            mesh.texture = ss.spriteSheet;
            mesh.textureMin = uv.min;
            mesh.textureMax = uv.max;

            mesh.notifyUpdate();
        })

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

    onBeforeUpdate(): void {
        this.scene.game.renderer.clear();
    }

    onAfterUpdate(): void {

        const camera = this.findCamera();

        if (camera === null) {
            return;
        }

        camera.update();

        camera.camera.position.copy(camera.entity.position);
        camera.camera.quaternion.setFromEuler(new Euler(camera.entity.transform.rotation.x, camera.entity.transform.rotation.y, camera.entity.transform.rotation.z, 'YXZ'))

        let euler = new Euler();

        for (const type of this.managedComponents) {
            this.scene.components.forEach(type, (component) => {

                if (!(component instanceof Renderable)) return;

                const position = component.entity.position;

                if (component instanceof TextMesh) {
                    position.y -= component.size / 2;
                    if (component.alignment === TextHAlignment.Center) {
                        position.x -= component.textSize.x / 2;
                    } else if (component.alignment === TextHAlignment.Right) {
                        position.x -= component.textSize.x;
                    }
                }

                euler.set(component.entity.rotation.x * DEG2RAD, component.entity.rotation.y * DEG2RAD, component.entity.rotation.z * DEG2RAD, 'XYZ');
                
                for (const mesh of component.meshes) {
                    mesh.position.copy(position);
                    mesh.rotation.copy(euler);
                }
            });
        }



        this.scene.game.renderer.render(this.scene.scene, camera.camera);
    }
}