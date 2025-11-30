import {Entity} from "../dist/ecs/entity";
import {Component, ComponentRegistry} from "../dist/ecs/component";
import {ITransform} from "../dist/core/transform"
import { BoxGeometry, Clock, Color, Euler, InstancedMesh, Matrix4, Mesh, MeshNormalMaterial, PerspectiveCamera, Quaternion, Scene, Vector3, WebGLRenderer } from "three";

class Transform extends Component{
    public transform: ITransform;

    constructor(entity: Entity) {
        super(entity);
        this.transform = {
            position: new Vector3(0, 0, 0),
            scale: new Vector3(1, 1, 1),
            rotation: new Vector3(0, 0, 0)
        }
    }
}

class RandomMove extends Component {
    direction: Vector3;
    speed: number;
    rotation: Vector3;

    constructor(entity: Entity) {
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

class MeshComponent extends Component {
    mesh: Mesh;

    constructor(entity: Entity) {
        super(entity);
    }
}

class InstancedMeshComponent extends Component {
    index: number;

    constructor(entity: Entity) {
        super(entity);
    }
}

window.onload = () => {

    console.log("Creating Scene");

    const registry = new ComponentRegistry();
    registry.register(Transform, "transform");
    registry.register(RandomMove, "random_move");
    registry.register(MeshComponent, "mesh");
    registry.register(InstancedMeshComponent);

    const container = document.getElementById('container')! as HTMLDivElement;
    const fps = document.getElementById('fps')! as HTMLSpanElement;

    const scene = new Scene();
    scene.background = new Color(0.2, 0.2, 0.2);

    const camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000 );
    camera.position.z = 30;

    const renderer = new WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const gl = renderer.getContext();

    // try to get the debug extension
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const rendererName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        console.log('GPU Vendor:', vendor);
        console.log('GPU Renderer:', rendererName);
    } else {
        console.log('WEBGL_debug_renderer_info not supported');
    }

    const entities: Entity[] = [];

    const count = 1000;

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshNormalMaterial();
    const mesh = new InstancedMesh(geometry, material, count);

    scene.add(mesh);

    for (let i = 0; i < count; i++) {
        let entity = new Entity("Entity_" + i.toString());
        registry.addByName(entity, "transform");
        registry.addByName(entity, "random_move");
        const mesh = registry.add(entity, InstancedMeshComponent);
        mesh.index = i;
        entities.push(entity);


    }

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    })

    let lastTime = 0;

    const clock = new Clock();

    function animate(time: number) {

        const dt = (time - lastTime) / 1000;
        lastTime = time;

        fps.innerText = 1 / dt;

        requestAnimationFrame(animate);

        const matrix = new Matrix4();
        const quat = new Quaternion();


        registry.forEach(MeshComponent, (mesh) => {
            if (!mesh.mesh.parent) {
                scene.add(mesh.mesh);
            }

            let transform = registry.get(mesh.entity, Transform);
            mesh.mesh.position.copy(transform.transform.position);
            //mesh.mesh.rotation.copy(transform.transform.rotation);
            //mesh.mesh.scale.copy(transform.transform.scale);
        });

        registry.forEach(InstancedMeshComponent, (instance) => {
            let transform = registry.get(instance.entity, Transform);
            const euler = new Euler(transform.transform.rotation.x, transform.transform.rotation.y, transform.transform.rotation.z, 'XYZ');
            quat.setFromEuler(euler);
            matrix.compose(transform.transform.position, quat, transform.transform.scale);
            mesh.setMatrixAt(instance.index, matrix);
        })

        mesh.instanceMatrix.needsUpdate = true;

        const tmp = new Vector3();

        registry.forEach(Transform, (transform) => {
            let random = registry.get(transform.entity, RandomMove);
            if (!random) {
                throw Error("RandomMove missing on entity");
            }
            // console.log(random.direction.multiplyScalar(dt));
            tmp.copy(random.direction).multiplyScalar(dt * random.speed);
            transform.transform.position.add(tmp);

            tmp.copy(random.rotation).multiplyScalar(dt);
            transform.transform.rotation.add(tmp);

            if (Math.abs(transform.transform.position.x) > 25) random.direction.x *= -1;
            if (Math.abs(transform.transform.position.y) > 25) random.direction.y *= -1;
            if (Math.abs(transform.transform.position.z) > 25) random.direction.z *= -1;
        });

        renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
}