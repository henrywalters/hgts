import { Box2, Texture, Vector2 } from "three";
import { Rect } from "./interfaces/math";

export class SpriteSheet {
    texture: Texture;
    cells: Vector2;
    offset: Vector2;
    padding: Vector2;

    constructor(texture: Texture, cells: Vector2, padding: Vector2, offset: Vector2) {
        this.texture = texture;
        this.cells = cells;
        this.padding = padding;
        this.offset = offset;
    }

    getCellPos(index: number) {
        if (index < 0 || index > this.cells.x * this.cells.y) {
            throw new Error(`SpriteSheet index: ${index} out of bounds for size: ${this.cells.x}x${this.cells.y}`);
        }
        const row = Math.floor(index / this.cells.x);
        const col = index - row * this.cells.x;

        return new Vector2(col, row);
    }

    getCell(pos: Vector2): Box2 {
        const size = new Vector2((this.texture.image as any).width, (this.texture.image as any).height);
        const cellSize = size.clone().divide(this.cells);
        const cellPos = cellSize.clone().multiply(pos).add(cellSize.clone().multiplyScalar(0.5));
        cellSize.sub(this.padding.clone().multiplyScalar(2));
        const half = cellSize.clone().multiplyScalar(0.5);
        const min = cellPos.clone().sub(half);
        const max = cellPos.clone().add(half);
        // console.log(size, min, max);
        return new Box2(min.divide(size), max.divide(size));
    }
}