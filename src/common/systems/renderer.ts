import { IScene } from "../../core/interfaces/scene";
import { System } from "../../ecs/system";
import { OrthographicCamera, PerspectiveCamera } from "../components/camera";
import { MeshComponent } from "../components/mesh";

export class Renderer extends System {

    constructor(scene: IScene) {
        super(scene);
        this.scene.components.register(PerspectiveCamera);
        this.scene.components.register(OrthographicCamera);
        this.scene.components.register(MeshComponent);
    }

    onAfterUpdate(): void {

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

        if (camera === null) {
            console.error("Camera is not present in scene");
        }

        camera!.camera.position.copy(camera!.entity.transform.position);

        this.scene.components.forEach(MeshComponent, (mesh) => {
            if (!mesh.mesh.parent) {
                this.scene.scene.add(mesh.mesh);
            }

            let transform = mesh.entity.transform;
            mesh.mesh.position.copy(transform.position);
        });


        this.scene.renderer.render(this.scene.scene, camera!.camera);
    }
}