import { BoxGeometry, Color, MeshNormalMaterial, Vector3 } from "three";
import { MeshComponent } from "../common/components/mesh";
import { Transform } from "../common/components/transform";
import { Scene } from "../core/scene";
import { Component } from "../ecs/component";
import { IEntity } from "../ecs/interfaces/entity";
import { Renderer } from "../common/systems/renderer";
import { System } from "../ecs/system";
import { PerspectiveCamera } from "../common/components/camera";

class RandomMove extends Component {
    direction: Vector3;
    speed: number;
    rotation: Vector3;

    constructor(entity: IEntity) {
        super(entity);
        this.direction = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        this.speed = (Math.random() * 5) + 5;
        this.direction.normalize();
        this.rotation = new Vector3(
            (Math.random() - 0.5) * Math.PI, // radians/sec
            (Math.random() - 0.5) * Math.PI,
            (Math.random() - 0.5) * Math.PI
        );
    }
}

class CubeSystem extends System {
    onUpdate(dt: number): void {

        const tmp = new Vector3();

        this.scene.components.forEach(RandomMove, (random) => {
            const transform = random.entity.transform;
            tmp.copy(random.direction).multiplyScalar(dt * random.speed);
            transform.position.add(tmp);

            tmp.copy(random.rotation).multiplyScalar(dt);
            transform.rotation.add(tmp);

            if (Math.abs(transform.position.x) > 25) random.direction.x *= -1;
            if (Math.abs(transform.position.y) > 25) random.direction.y *= -1;
            if (Math.abs(transform.position.z) > 25) random.direction.z *= -1;
        });
    }
}


export class RandomCubes extends Scene {

    constructor() {
        super();
        this.components.register(RandomMove);
        this.addSystem(Renderer);
        this.addSystem(CubeSystem);
    }

    public onStart(): void {

        const camera = this.addEntity("Camera").addComponent(PerspectiveCamera);
        camera.camera.fov = 75;
        camera.camera.near = 0.01;
        camera.camera.far = 1000;
        camera.camera.aspect = 3/4;

        camera.entity.transform.position = new Vector3(0, 0, 30);

        for (let i = 0; i < 1000; i++) {
            const cube = this.addEntity(`Cube_${i}`);
            cube.addComponent(RandomMove);
            const mesh = cube.addComponent(MeshComponent);
            mesh.mesh.geometry = new BoxGeometry(1, 1, 1);
            mesh.mesh.material = new MeshNormalMaterial();
        }

        this.scene.background = new Color(0.2, 0.2, 0.2);
    }

    public onResize(width: number, height: number): void {
        this.components.forEach(PerspectiveCamera, (camera) => {
            camera.camera.aspect = width / height;
            camera.camera.updateProjectionMatrix();
        });
    }
    
}