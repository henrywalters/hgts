import { Mesh, Vector2 } from "three";
import { Param, Types } from "../../../core/reflection";
import { Component } from "../../../ecs/component";
import { AABB } from "../../../utils/math";
import { UI } from "../../systems/ui";
import { clamp } from "three/src/math/MathUtils.js";
import { EntityEvents } from "../../../core/events";
import { MeshPrimitive } from "../mesh";

export enum TextHAlignment {
    Left = 'Left',
    Center = 'Center',
    Right = 'Right',
}

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

export enum UIUnit {
    Pixel = 'Pixel',
    Percent = 'Percent',
}

export class UIElement extends Component {

    protected meshes: Mesh[] = [];

    @Param({type: Types.Enum, enum: AnchorAlignment})
    anchorAlignment: AnchorAlignment = AnchorAlignment.Center;

    @Param({type: Types.Boolean})
    anchored: boolean = true;

    @Param({type: Types.Enum, enum: UIUnit})
    sizeUnit: UIUnit = UIUnit.Percent;

    @Param({type: Types.Float})
    width: number = 100;

    @Param({type: Types.Float})
    height: number = 100;

    @Param({type: Types.Enum, enum: UIUnit})
    marginUnit: UIUnit = UIUnit.Pixel;

    @Param({type: Types.Vector2})
    margin: Vector2 = new Vector2();

    innerSize = new Vector2();

    size = new Vector2();

    update() {
        const parentSize = new Vector2();
        const parentPos = new Vector2();
        this.entity.scene.game.renderer.getSize(parentSize);

        if (this.entity.parent) {
            for (const component of this.entity.parent.getComponents()) {
                if (component instanceof UIElement) {
                    parentSize.copy(component.innerSize);
                    parentPos.x = component.entity.position.x;
                    parentPos.y = component.entity.position.y;
                }
            }
        }

        const newSize = new Vector2(this.width, this.height);

        if (this.sizeUnit === UIUnit.Percent) {
            newSize.setX(parentSize.x * this.width * 0.01);
            newSize.setY(parentSize.y * this.height * 0.01);
        }

        const newInnerSize = new Vector2(newSize.x, newSize.y);

        const addMargin = (x: number, y: number) => {
            newInnerSize.setX(clamp(newSize.x - x, 0, parentSize.x));
            newInnerSize.setY(clamp(newSize.y - y, 0, parentSize.y));
        }


        if (this.marginUnit === UIUnit.Percent) {
            addMargin(parentSize.x * this.margin.x * 0.01, parentSize.y * this.margin.y * 0.01);
        } else {
            addMargin(this.margin.x, this.margin.y);
        }

        if (this.size.x !== newSize.x || this.size.y !== newSize.y || this.innerSize.x !== newInnerSize.x || this.innerSize.y !== newInnerSize.y) {
            this.size.copy(newSize);
            this.innerSize.copy(newInnerSize);
            console.log(this.size, this.innerSize);
            this.entity.scene.entityEvents.emit({
                type: EntityEvents.UpdateComponent,
                entity: this.entity,
                component: this,
            });
        }

        if (this.anchored) {
            const pos = getAnchorPosition(this.size, parentSize, this.anchorAlignment);
            if (pos.x !== this.entity.transform.position.x || pos.y !== this.entity.transform.position.y) {
                this.entity.transform.position.x = pos.x;
                this.entity.transform.position.y = pos.y;
                // this.entity.scene.entityEvents.emit({
                //     type: EntityEvents.Change,
                //     entity: this.entity,
                // });
            }
        }

        const mesh = this.entity.getComponent(MeshPrimitive);
        if (mesh && (mesh.width !== this.innerSize.x || mesh.height !== this.innerSize.y)) {
            mesh.width = this.innerSize.x;
            mesh.height = this.innerSize.y;
            this.entity.scene.entityEvents.emit({
                type: EntityEvents.UpdateComponent,
                entity: this.entity,
                component: mesh,
            })
        }
    }

    getAABB(): AABB {
        return new AABB(
            new Vector2(this.entity.position.x - this.size.x / 2, this.entity.position.y - this.size.y / 2),
            new Vector2(this.entity.position.x + this.size.x / 2, this.entity.position.y + this.size.y / 2)
        )
    }
}

export abstract class UIRenderableElement extends UIElement {
    abstract addMeshes(): void;

    abstract positionMeshes(): void;

    abstract updateMeshes(): void;

    removeMeshes() {
        for (const mesh of this.meshes) {
            this.entity.scene.scene.remove(mesh);
        }
        this.meshes = [];
    }
}