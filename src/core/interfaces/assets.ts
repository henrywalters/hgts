import { Texture, Vector2 } from "three";
import { Font, FontData } from "three/examples/jsm/Addons.js";
import { SpriteSheet } from "../spriteSheet";

export interface IAssetPool<T> {
    has(key: string): boolean;
    get(key: string): T;
    set(key: string, asset: T): void;
}

export interface IFontData {
    name: string;
    url?: string;
    data?: FontData;
}

export interface ITextureData {
    name: string;
    url: string;
}

export interface Vector2Data {
    x: number;
    y: number;
}

export interface ISpriteSheetData extends ITextureData {
    cells: Vector2Data;
    padding: Vector2Data;
    offset: Vector2Data;
}

export interface IAssetsData {
    fonts?: IFontData[];
    textures?: ITextureData[];
    spriteSheets?: ISpriteSheetData[];
}

export interface IAssets {
    fonts: IAssetPool<Font>;
    textures: IAssetPool<Texture>;
    spriteSheets: IAssetPool<SpriteSheet>;

    loadFont(data: IFontData): Promise<Font>;
    loadTexture(data: ITextureData): Promise<Texture>;
    loadSpriteSheet(data: ISpriteSheetData): Promise<SpriteSheet>;
}

