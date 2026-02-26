import { Vector2, Vector3 } from "three";
import { AABB } from "./math";
import { Grid } from "./grid";

export class GridMap<T> {
    private grid: Map<number, Map<number, T>> = new Map();
    private _count: number = 0;

    public get count() { return this._count; }

    public has(pos: Vector2) {
        return this.grid.has(pos.x) && this.grid.get(pos.x)!.has(pos.y);
    }

    public clear() {
        this.grid = new Map();
        this._count = 0;
    }

    public set(pos: Vector2, value: T) {
        if (!this.grid.has(pos.x)) {
            this.grid.set(pos.x, new Map());
        }
        if (!this.grid.get(pos.x)!.has(pos.y)) {
            this.grid.get(pos.x)!.set(pos.y, value);
            this._count++;
        };
    }

    public remove(pos: Vector2) {
        if (this.has(pos)) {
            this.grid.get(pos.x)!.delete(pos.y);
            this._count--;

            if (this.grid.get(pos.x)!.size === 0) {
                this.grid.delete(pos.x);
            }
        }
    }

    public get(pos: Vector2): T | null {
        return this.has(pos) ? this.grid.get(pos.x)!.get(pos.y)! : null;
    }

    public forEach(cb: (pos: Vector2, val: T, idx: number) => void) {
        let index = 0;
        for (const [col, els] of this.grid) {
            for (const [row, el] of this.grid.get(col)!) {
                cb(new Vector2(col, row), el, index);
                index++;
            }
        }
    }

    public isColliding(aabb: AABB, grid: Grid) {
        const a = grid.getCellIndex(new Vector3(aabb.min.x, aabb.min.y, 0));
        const b = grid.getCellIndex(new Vector3(aabb.max.x, aabb.max.y, 0));

        const cells: Vector2[] = [];

        for (let i = a.x - 1; i <= b.x + 1; i++) {
            for (let j = a.y - 1; j <= b.y + 1; j++) {
                cells.push(new Vector2(i, j));
            }
        }

        for (const cell of cells) {
            if (!this.has(cell)) continue;

            const cellPos = grid.getCellPos(cell);
            const cellAABB = new AABB(
                new Vector2(cellPos.x - grid.cellSize.x / 2, cellPos.y - grid.cellSize.y / 2), 
                new Vector2(cellPos.x + grid.cellSize.x / 2, cellPos.y + grid.cellSize.y / 2)
            );

            if (aabb.intersects(cellAABB)) {
                return true;
            }
        }

        return false;
    }
}