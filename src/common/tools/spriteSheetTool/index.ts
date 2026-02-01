import { Color, Vector2, Vector3 } from "three";
import { Game } from "../../../core/game";
import { MeshPrimitive, MeshPrimitiveType } from "../../components/mesh";
import { Transform } from "../../components/transform";
import { SpriteSheetToolManifest } from "./manifest";
import { SpriteSheetTool } from "./scene";
import { CameraPan, CameraZoom, OrthographicCamera } from "../../components/camera";
import { Line } from "../../components/line";
import { IEntity } from "../../../ecs/interfaces/entity";
import { ISpriteSheetData } from "../../../core/interfaces/assets";

export function createSpriteSheetTool(container: HTMLDivElement) {

    let imageSize = new Vector2(100, 100);

    let cells: Vector2 = new Vector2(1, 1);
    let padding: Vector2 = new Vector2(0, 0);
    let offset: Vector2 = new Vector2(0, 0);

    const game = new Game(SpriteSheetToolManifest);
    const scene = game.currentScene! as SpriteSheetTool;

    let spriteBoxes: IEntity[] = [];

    const addSpriteBox = (size: Vector2, pos: Vector2, color: Color) => {
            const entity = scene.addEntity();
            entity.addComponent(Transform);
            const outline = entity.addComponent(Line);
            outline.color = color;
            outline.setFromRect(size, pos);
            outline.notifyUpdate();

            spriteBoxes.push(entity);
    }

    const updateSpriteBoxes = () => {
        for (const entity of spriteBoxes) {
            scene.removeEntity(entity);
        }
        spriteBoxes = [];

        const cellSize = imageSize.clone().divide(cells);
        const paddedCellSize = cellSize.clone().sub(padding.clone().multiplyScalar(2));

        for (let i = 0; i < cells.x; i++) {
            for (let j = 0; j < cells.y; j++) {
                const pos = new Vector2(-imageSize.x / 2 + i * cellSize.x + cellSize.x / 2, -imageSize.y / 2 + j * cellSize.y + cellSize.y / 2);
                addSpriteBox(cellSize, pos, new Color('red'));
                addSpriteBox(paddedCellSize, pos.clone().add(offset), new Color('blue'));
            }
        }
    }

    const outlineEntity = scene.addEntity();
    outlineEntity.addComponent(Transform);
    const outline = outlineEntity.addComponent(Line);
    outline.setFromRect(imageSize);

    const spriteEntity = scene.addEntity();
    spriteEntity.addComponent(Transform);
    const sprite = spriteEntity.addComponent(MeshPrimitive);
    sprite.type = MeshPrimitiveType.Plane;
    sprite.width = imageSize.x;
    sprite.height = imageSize.y;
    sprite.color = new Color('red');
    sprite.notifyUpdate();

    const cameraEntity = scene.addEntity();
    cameraEntity.addComponent(CameraPan);
    cameraEntity.addComponent(CameraZoom);
    cameraEntity.addComponent(Transform);
    const camera = cameraEntity.addComponent(OrthographicCamera);
    cameraEntity.transform.position.z = 5;

    const canvas = game.renderer.domElement;
    canvas.width = 1080;
    canvas.height = 720;
    canvas.style.margin = 'auto';

    game.resize(1080, 720);

    container.appendChild(canvas);

    game.run();

    const listenToInput = (name: string, onChange: (value: number) => void) => {
        const el = document.getElementById(name)! as HTMLInputElement;
        el.addEventListener('change', (e) => {
            onChange(parseFloat(el.value));
            updateSpriteBoxes();
        })
    }

    listenToInput('columns', (x) => {cells.setX(x)});
    listenToInput('rows', (x) => {cells.setY(x)});
    listenToInput('padding_x', (x) => {padding.setX(x)});
    listenToInput('padding_y', (x) => {padding.setY(x)});
    listenToInput('offset_x', (x) => {offset.setX(x)});
    listenToInput('offset_y', (x) => {offset.setY(x)});

    document.getElementById('load_sprite')?.addEventListener('click', async (e) => {
        const url = (document.getElementById('sprite_url')! as HTMLInputElement).value;
        const texture = await scene.setSprite(url);
        // @ts-ignore
        sprite.width = texture.image.width;
        // @ts-ignore
        sprite.height = texture.image.height;
        sprite.texture = "sprite";
        sprite.notifyUpdate();

        imageSize.set(sprite.width, sprite.height);

        outline.setFromRect(imageSize);

        outline.notifyUpdate();

        updateSpriteBoxes();
    });

    document.getElementById('save_sprite')?.addEventListener('click', async (e) => {
        const name = (document.getElementById('sprite_name')! as HTMLInputElement).value;
        const url = (document.getElementById('sprite_url')! as HTMLInputElement).value;

        const output: ISpriteSheetData = {
            name,
            url,
            cells,
            padding,
            offset,
        };

        // @ts-ignore
        const file = await window.showSaveFilePicker({
            suggestedName: 'sprite_sheet.json',
            types: [{
                description: 'JSON Files',
                accept: { 'text/plain': ['.json']}
            }],
        });
        const writeable = await file.createWritable();
        await writeable.write(JSON.stringify(output, null, 2));
        await writeable.close();
    })

    
}