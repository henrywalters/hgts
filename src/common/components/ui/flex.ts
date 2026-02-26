import { Vector2 } from "three";
import { UIElement, UIFrame } from "./element";
import { Int } from "../../../core/reflection";

export class FlexColumn extends UIElement {
    protected getFrame(child: UIElement): UIFrame {
        const size = new Vector2(this.innerSize.x, this.innerSize.y / this.entity.children.length);
        const index = this.entity.children.findIndex((entity) => entity.id === child.entity.id);
        const pos = this.entity.position;
        return {
            size,
            offset: new Vector2(0, 0)
        }
    }
}

export class FlexRow extends UIElement {
    protected getFrame(child: UIElement): UIFrame {
        const size = new Vector2(this.innerSize.x / this.entity.children.length, this.innerSize.y);
        const index = this.entity.children.findIndex((entity) => entity.id === child.entity.id);
        return {
            size,
            offset: new Vector2(-this.innerSize.x / 2 + size.x * index + size.x / 2, 0)
        }
    }
}

export class FlexGrid extends UIElement {
    @Int()
    cols: number = 1;

    @Int()
    rows: number = 1;

    protected getFrame(child: UIElement): UIFrame {
        const size = new Vector2(this.innerSize.x / this.cols, this.innerSize.y / this.rows);
        const index = this.entity.children.findIndex((entity) => entity.id === child.entity.id);

        const col = index % this.cols;
        const row = Math.floor(index / this.cols);

        return {
            size,
            offset: new Vector2(-this.innerSize.x / 2 + size.x * col + size.x / 2, this.innerSize.y / 2 - size.y * row - size.y / 2),
        }
    }
}