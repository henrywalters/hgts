import { Color, Vector2, Scene, InstancedMesh, Matrix4, Vector3, BoxGeometry, MeshBasicMaterial } from "three";
import { Float, Int, Param, Types } from "../../core/reflection";
import { Renderable } from "./renderable";
import { Grid } from "../../utils/grid";

export class GridDisplay extends Renderable {
    instanced = true;

    @Param({type: Types.Class, ctr: Grid})
    grid: Grid = new Grid();

    @Param({type: Types.Vector2})
    lineThickness = new Vector2(1, 1);

    @Param({type: Types.Color})
    color: Color = new Color('blue');

    addMeshes(scene: Scene) {
        const geometry1 = new BoxGeometry(this.lineThickness.x, this.grid.size.y + this.lineThickness.y);
        const geometry2 = new BoxGeometry(this.grid.size.x + this.lineThickness.x, this.lineThickness.y);

        const material1 = new MeshBasicMaterial({
            color: this.color
        });
        const material2 = new MeshBasicMaterial({
            color: this.color
        });

        this.meshes.push(new InstancedMesh(geometry1, material1, this.grid.cells.x + 1));
        this.meshes.push(new InstancedMesh(geometry2, material2, this.grid.cells.y + 1));

        const cellSize = this.grid.size.clone().divide(this.grid.cells);

        for (let i = 0; i <= this.grid.cells.x; i++) {
            let matrix = new Matrix4();
            matrix.setPosition(new Vector3(this.grid.size.x / -2 + i * cellSize.x, 0, 0));
            (this.meshes[0] as InstancedMesh).setMatrixAt(i, matrix);
        }

        for (let i = 0; i <= this.grid.cells.y; i++) {
            let matrix = new Matrix4();
            matrix.setPosition(new Vector3(0, this.grid.size.y / -2 + i * cellSize.y, 0));
            (this.meshes[1] as InstancedMesh).setMatrixAt(i, matrix);
        }

        for (let i = 0; i < 2; i++) {
            (this.meshes[i] as InstancedMesh).instanceMatrix.needsUpdate = true;
            scene.add(this.meshes[i]);
        }
    }

    updateMeshes(scene: Scene): void {
        this.removeMeshes(scene);
        this.addMeshes(scene);
    }
}