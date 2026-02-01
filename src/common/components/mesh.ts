import { BoxGeometry, Color, DoubleSide, Float32BufferAttribute, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, SphereGeometry, Vector2, Vector3 } from "three";
import { Boolean, Float, Param, Types } from "../../core/reflection";
import { TextGeometry } from "three/examples/jsm/Addons.js";
import { Assets } from "../../core/assets";
import { AABB } from "../../utils/math";
import { TextHAlignment } from "./ui/alignment";
import { Renderable } from "./renderable";

export enum MeshPrimitiveType {
    Cube = 'Cube',
    Sphere = 'Sphere',
    Plane = 'Plane'
};

export class MeshPrimitive extends Renderable {

    @Param({type: Types.Enum, enum: MeshPrimitiveType})
    type: MeshPrimitiveType = MeshPrimitiveType.Cube;

    @Float()
    width: number = 1;

    @Float()
    height: number = 1;

    @Float()
    depth: number = 1;

    @Float()
    radius: number = 1;

    @Param({type: Types.Color})
    color: Color = new Color('black');

    @Boolean()
    transparent: boolean = false;

    @Float()
    opacity: number = 1.0;

    @Param({type: Types.String})
    texture: string = "";

    @Param({type: Types.Vector2})
    textureMin: Vector2 = new Vector2();

    @Param({type: Types.Vector2})
    textureMax: Vector2 = new Vector2(1, 1);

    updateMeshes(scene: Scene): void {
        if (this.type === MeshPrimitiveType.Cube) {
            this.mesh.geometry = new BoxGeometry(this.width, this.height, this.depth);
        } else if (this.type === MeshPrimitiveType.Plane) {
            this.mesh.geometry = new PlaneGeometry(this.width, this.height);
        } else if (this.type === MeshPrimitiveType.Sphere) {
            this.mesh.geometry = new SphereGeometry(this.radius);
        } else {
            throw new Error(`Unsupported Mesh Primtiive ${this.type}`);
        }

        if (Assets.textures.has(this.texture)) {
            
            const uvs = new Float32Array([
                this.textureMin.x, this.textureMax.y, // v0 (top-left)
                this.textureMax.x, this.textureMax.y, // v1 (top-right)
                this.textureMin.x, this.textureMin.y, // v2 (bottom-left)
                this.textureMax.x, this.textureMin.y, // v3 (bottom-right)
            ]);
            
            this.mesh.geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
            this.mesh.geometry.attributes.uv.needsUpdate = true;

            this.mesh.material = new MeshBasicMaterial({
                map: Assets.textures.get(this.texture),
                transparent: this.transparent,
                opacity: this.opacity,
                side: DoubleSide,
            });
            this.mesh.material.needsUpdate = true;
        } else {
            this.mesh.material = new MeshBasicMaterial({
                color: this.color,
                transparent: this.transparent,
                opacity: this.opacity,
            })
        }
    }
}

export class TextMesh extends Renderable {

    @Param({type: Types.String})
    text: string = "";

    @Param({type: Types.String})
    font: string = "";

    @Param({type: Types.Int})
    size: number = 24;

    @Float()
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

    updateMeshes(scene: Scene): void {
        if (!Assets.fonts.has(this.font)) {
            console.warn(`Font does not exist ${this.font}`);
            return;
        }

        const font = Assets.fonts.get(this.font);

        this.mesh.geometry = new TextGeometry(this.text, {
            font,
            size: this.size,
            depth: this.depth,
        });

        this.mesh.geometry.computeBoundingBox();

        this.mesh.geometry.boundingBox?.getSize(this.textSize);
        this.textSize.setY(this.size);

        this.mesh.material = new MeshBasicMaterial({color: this.color});
    }
}