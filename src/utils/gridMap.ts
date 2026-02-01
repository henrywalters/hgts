import { Vector2 } from "three";

export class GridMap<T> {
    private grid: Map<number, Map<number, T>> = new Map();
    private _count: number = 0;

    public get count() { return this._count; }

    public has(pos: Vector2) {
        return this.grid.has(pos.x) && this.grid.get(pos.x)!.has(pos.y);
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
}