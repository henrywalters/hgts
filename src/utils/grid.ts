import { Vector2, Vector3 } from "three";
import { Param, Types } from "../core/reflection";

export class Grid {

    @Param({type: Types.Vector2})
    size: Vector2 = new Vector2(1000, 1000);

    @Param({type: Types.Vector2})
    cells: Vector2 = new Vector2(20, 20);
    
    get cellSize() { 
        return this.size.clone().divide(this.cells);
    }

    
    public getIndex(cellIndex: Vector2): number {
        return cellIndex.y * this.cells.x + cellIndex.x;
    }

    getCellIndex(worldPos: Vector3, origin: Vector3 = new Vector3): Vector2 {
        const cellSize = this.size.clone().divide(this.cells);
        const pos = worldPos.clone().sub(origin);

        return new Vector2(pos.x, pos.y).divide(cellSize).floor();
    }

    getCellPos(index: Vector2, origin: Vector3 = new Vector3): Vector3 {
        const cellSize = (this.size).clone().divide(this.cells);
        const pos = new Vector3(cellSize.x * index.x + cellSize.x / 2, cellSize.y * index.y + cellSize.y / 2, 0);
        return origin.add(pos);
    }

    getNeighborhood(cell: Vector2, size: number = 1) {
        const neighbors: Vector2[] = [];
        for (let i = cell.x - size; i <= cell.x + size; i++) {
            for (let j = cell.y - size; j <= cell.y + size; j++) {
                neighbors.push(new Vector2(i, j));
            }
        }
        return neighbors;
    }

}