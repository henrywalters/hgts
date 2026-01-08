import { Color, Mesh, MeshBasicMaterial, Vector2 } from "three";
import { Param, Types } from "../../../core/reflection";
import { getAnchorPosition, TextHAlignment, UIRenderableElement } from "./element";
import { Font, TextGeometry } from "three/examples/jsm/Addons.js";
import { Assets } from "../../../core/assets";

export class Text extends UIRenderableElement {

    @Param({type: Types.String})
    font: string = "";

    @Param({type: Types.String})
    text: string = "";

    @Param({type: Types.Int})
    fontSize: number = 24;

    @Param({type: Types.Int})
    lineSpacing: number = 0;

    @Param({type: Types.Color})
    color: Color = new Color('black');

    @Param({type: Types.Enum, enum: TextHAlignment})
    alignment: TextHAlignment = TextHAlignment.Left;

    measureText(text: string, font: Font): number {
        let width = 0;
        const scale = this.fontSize / font.data.resolution;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const glyph = font.data.glyphs[char];
            
            if (glyph) {
                width += (glyph.ha || 0) * scale;
            }
        }
        
        return width;
    }

    splitText(font: Font): string[] {
        const words = this.text.split(' ');
        const lines = [];

        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const width = this.measureText(testLine, font);

            if (width > this.innerSize.x && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    addMeshes(): void {
        console.log("Add Meshes");
        if (!Assets.fonts.has(this.font)) return;

        const font = Assets.fonts.get(this.font);

        const lines = this.splitText(font);

        console.log(lines);

        for (const line of lines) {
            const mesh = new Mesh();
            mesh.geometry = new TextGeometry(line, {
                font,
                size: this.fontSize,
            });
            mesh.material = new MeshBasicMaterial({color: this.color});
            this.meshes.push(mesh);
            this.entity.scene.scene.add(mesh);
        }

        console.log(this.meshes.length);
    }

    positionMeshes(): void {

        let xSize = 0;
        let ySize = this.lineSpacing * (this.meshes.length - 1);

        let sizes: number[] = [];

        for (let i = 0; i < this.meshes.length; i++) {
            this.meshes[i].geometry.computeBoundingBox();
            const size = this.meshes[i].geometry.boundingBox!;
            sizes.push(size.max.x - size.min.x);
            ySize += this.fontSize;
            let x = size.max.x - size.min.x;
            if (x > xSize) xSize = x;
        }

        const pos = getAnchorPosition(new Vector2(xSize, ySize), this.innerSize, this.anchorAlignment);
        pos.x += this.entity.position.x;
        pos.y += this.entity.position.y - this.fontSize;
        pos.y += ySize / 2;

        for (let i = 0; i < this.meshes.length; i++) {
            this.meshes[i].position.setY(pos.y);

            let x = pos.x - xSize / 2;

            if (this.alignment === TextHAlignment.Center) {
                x = pos.x - (sizes[i]) / 2;
            } else if (this.alignment === TextHAlignment.Right) {
                x = pos.x - xSize / 2 + (xSize - sizes[i]);
            }

            this.meshes[i].position.setX(x);

            pos.setY(pos.y - this.lineSpacing - this.fontSize);
        }

        // console.log(xSize, ySize);
    }

    updateMeshes(): void {
        this.removeMeshes();
        this.addMeshes();
    }
}