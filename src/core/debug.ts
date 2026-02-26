import { BufferGeometry, Color, Line, LineBasicMaterial, Mesh, Scene, Vector2, Vector3 } from "three";
import { LineGeometry, LineMaterial } from "three/examples/jsm/Addons.js";
import { AABB } from "../utils/math";

export class DebugRenderer {
    private scene: Scene;
    private meshes: Mesh[] = [];
    private size: Vector2 = new Vector2();

    constructor(scene: Scene) {
        this.scene = scene;
    }

    drawLine(a: Vector3, b: Vector3, color: Color = new Color('red'), lineThickness: number = 1) {
        const geometry = new LineGeometry();
        geometry.setFromPoints([a, b]);
        const material = new LineMaterial({
            linewidth: lineThickness,
            color,
            resolution: this.size,
        });
        const mesh = new Mesh(geometry, material);
        this.meshes.push(mesh);
        this.scene.add(mesh);

    }

    clear(size: Vector2) {
        this.size = size;
        for (const mesh of this.meshes) {
            this.scene.remove(mesh);
        }
        this.meshes = [];
    }
}

export class Debug {
    static instance: DebugRenderer | null = null;

    static Initialize(scene: Scene) {
        this.instance = new DebugRenderer(scene);
    }

    private static CheckInit() {
        if (!this.instance) {
            throw new Error("Debug must be initialized to render");
        }
    }

    static DrawLine(a: Vector3, b: Vector3, color: Color = new Color('red'), lineThickness: number = 1) {
        this.CheckInit();
        this.instance!.drawLine(a, b, color, lineThickness);
    }

    static DrawAABB(aabb: AABB, color: Color = new Color('red'), lineThickness: number = 1) {
        const points = [
            new Vector3(aabb.min.x, aabb.min.y, 100),
            new Vector3(aabb.max.x, aabb.min.y, 100),
            new Vector3(aabb.max.x, aabb.max.y, 100),
            new Vector3(aabb.min.x, aabb.max.y, 100),
        ];
        for (let i = 0; i < 4; i++) {
            this.DrawLine(points[i], points[(i + 1) % 4], color, lineThickness);
        }
    }

    static Clear(size: Vector2) {
        this.CheckInit();
        this.instance!.clear(size);
    }
}