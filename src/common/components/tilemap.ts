import { Scene, Color, BoxGeometry, MeshBasicMaterial, InstancedMesh, Matrix4, Vector2 } from "three";
import { Param, Types, Vector3 } from "../../core/reflection";
import { Component } from "../../ecs/component";
import { Grid } from "../../utils/grid";
import { Renderable } from "./renderable";
import { GridMap } from "../../utils/gridMap";

export class Tilemap extends Renderable {

    gridMap: GridMap<void> = new GridMap();

    @Param({type: Types.Class, ctr: Grid})
    grid: Grid = new Grid();

    @Param({type: Types.Color})
    color: Color = new Color('blue');

    addMeshes(scene: Scene) {

        const cellSize = this.grid.cellSize;

        const geometry = new BoxGeometry(cellSize.x, cellSize.y);

        const material = new MeshBasicMaterial({
            color: this.color
        });

        this.meshes.push(new InstancedMesh(geometry, material, this.gridMap.count));

        this.gridMap.forEach((pos, _, idx) => {
            const matrix = new Matrix4();
            // console.log(this.grid.getIndex(pos));
            matrix.setPosition(this.grid.getCellPos(pos));
            (this.mesh as InstancedMesh).setMatrixAt(idx, matrix);
        });

        (this.mesh as InstancedMesh).instanceMatrix.needsUpdate = true;

        scene.add(this.mesh);
    }

    updateMeshes(scene: Scene): void {
        this.removeMeshes(scene);
        this.addMeshes(scene);
    }
}