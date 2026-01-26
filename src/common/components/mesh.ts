import { Box3, BoxGeometry, Color, Material, Mesh, MeshBasicMaterial, PlaneGeometry, SphereGeometry, Vector2, Vector3 } from "three";
import { Component } from "../../ecs/component";
import { Param, Types } from "../../core/reflection";
import { TextGeometry } from "three/examples/jsm/Addons.js";
import { Assets } from "../../core/assets";
import { AABB } from "../../utils/math";
import { TextHAlignment } from "./ui/alignment";

export abstract class MeshComponent extends Component {
    abstract updateMesh(mesh: Mesh): void;
    abstract getAABB(mesh: Mesh): void;
}

export enum MeshPrimitiveType {
    Cube = 'Cube',
    Sphere = 'Sphere',
    Plane = 'Plane'
};

export class MeshPrimitive extends MeshComponent {
    @Param({type: Types.Enum, enum: MeshPrimitiveType})
    type: MeshPrimitiveType = MeshPrimitiveType.Cube;

    @Param({type: Types.Float})
    width: number = 1;

    @Param({type: Types.Float})
    height: number = 1;

    @Param({type: Types.Float})
    depth: number = 1;

    @Param({type: Types.Float})
    radius: number = 1;

    @Param({type: Types.Color})
    color: Color = new Color('black');

    updateMesh(mesh: Mesh): void {
        if (this.type === MeshPrimitiveType.Cube) {
            mesh.geometry = new BoxGeometry(this.width, this.height, this.depth);
        } else if (this.type === MeshPrimitiveType.Plane) {
            mesh.geometry = new PlaneGeometry(this.width, this.height);
        } else if (this.type === MeshPrimitiveType.Sphere) {
            mesh.geometry = new SphereGeometry(this.radius);
        } else {
            throw new Error(`Unsupported Mesh Primtiive ${this.type}`);
        }

        mesh.material = new MeshBasicMaterial({color: this.color});
    }

    getAABB() {
        const origin = new Vector2(this.entity.transform.position.x, this.entity.transform.position.y);
        let min = new Vector2();
        let max = new Vector2();
        if (this.type === MeshPrimitiveType.Cube) {
            min.addVectors(origin, new Vector2(-this.width / 2, -this.height / 2));
            max.addVectors(origin, new Vector2(this.width / 2, this.height / 2));
        } else if (this.type === MeshPrimitiveType.Plane) {
            min.addVectors(origin, new Vector2(-this.width / 2, -this.height / 2));
            max.addVectors(origin, new Vector2(this.width / 2, this.height / 2));
        } else if (this.type === MeshPrimitiveType.Sphere) {
            min.addVectors(origin, new Vector2(-this.radius, -this.radius));
            max.addVectors(origin, new Vector2(this.radius, this.radius));
        } else {
            throw new Error(`Unsupported Mesh Primtiive ${this.type}`);
        }

        return new AABB(min, max);
    }
}

export class TextMesh extends MeshComponent {

    @Param({type: Types.String})
    text: string = "";

    @Param({type: Types.String})
    font: string = "";

    @Param({type: Types.Int})
    size: number = 24;

    @Param({type: Types.Float})
    depth: number = 1;

    @Param({type: Types.Color})
    color: Color = new Color('black');

    @Param({type: Types.Enum, enum: TextHAlignment})
    alignment: TextHAlignment = TextHAlignment.Left;

    public textSize: Vector3 = new Vector3();

    yOffset() {

        if (!Assets.fonts.has(this.font)) {
            console.warn(`Font does not exist ${this.font}`);
            return 0;
        }

        const font = Assets.fonts.get(this.font);

        const ascender = font.data.ascender || 1;
        const descender = font.data.descender || 0;

        return  ((ascender + descender) / 2) * this.size / font.data.resolution;
    }

    updateMesh(mesh: Mesh) {

        if (!Assets.fonts.has(this.font)) {
            console.warn(`Font does not exist ${this.font}`);
            return;
        }

        const font = Assets.fonts.get(this.font);

        mesh.geometry = new TextGeometry(this.text, {
            font,
            size: this.size,
            depth: this.depth,
        });

        mesh.geometry.computeBoundingBox();

        mesh.geometry.boundingBox?.getSize(this.textSize);
        this.textSize.setY(this.size);

        mesh.material = new MeshBasicMaterial({color: this.color});
    }

    getAABB(mesh: Mesh): AABB {
        const pos = new Vector2;
        return new AABB(new Vector2(), new Vector2());
    }
}