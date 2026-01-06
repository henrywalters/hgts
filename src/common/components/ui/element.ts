import { Vector2 } from "three";
import { Param, Types } from "../../../core/reflection";
import { Component } from "../../../ecs/component";

export enum AnchorAlignment {
    TopLeft = 'TopLeft',
    TopCenter = 'TopCenter',
    TopRight = 'TopRight',
    Left = 'Left',
    Center = 'Center',
    Right = 'Right',
    BottomLeft = 'BottomLeft',
    BottomCenter = 'BottomCenter',
    BottomRight = 'BottomRight',
}

export function getAnchorPosition(size: Vector2, parentSize: Vector2, alignment: AnchorAlignment): Vector2 {
    const center = parentSize.clone().multiplyScalar(0.5);

    const lx = (-parentSize.x + size.x) / 2;
    const rx = (parentSize.x - size.x) / 2;
    const ty = (parentSize.y - size.y) / 2;
    const by = (-parentSize.y + size.y) / 2;

    switch(alignment) {
        case AnchorAlignment.TopLeft:
            return new Vector2(lx, ty);
        case AnchorAlignment.TopCenter:
            return new Vector2(0, ty);
        case AnchorAlignment.TopRight:
            return new Vector2(rx, ty);
        case AnchorAlignment.Left:
            return new Vector2(lx, 0);
        case AnchorAlignment.Center:
            return new Vector2();
        case AnchorAlignment.Right:
            return new Vector2(rx, 0);
        case AnchorAlignment.BottomLeft:
            return new Vector2(lx, by);
        case AnchorAlignment.BottomCenter:
            return new Vector2(0, by);
        case AnchorAlignment.BottomRight:
            return new Vector2(rx, by);
    }
}

export class UIElement extends Component {
    @Param({type: Types.Enum, enum: AnchorAlignment})
    anchorAlignment: AnchorAlignment = AnchorAlignment.Center;

    @Param({type: Types.Boolean})
    anchored: boolean = true;

    @Param({type: Types.Vector2})
    size: Vector2 = new Vector2();
}