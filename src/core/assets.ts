import { NearestFilter, Texture, TextureLoader, Vector2 } from "three";
import { IAssetPool, IAssets, IFontData, ISpriteSheetData, ITextureData } from "./interfaces/assets";
import { Font, FontData, FontLoader } from "three/examples/jsm/Addons.js";
import { SpriteSheet } from "./spriteSheet";

export class AssetPool<T> implements IAssetPool<T> {
    private _store: Map<string, T> = new Map();

    public has(key: string) {
        return this._store.has(key);
    }

    public get(key: string) {
        if (!this.has(key)) {
            throw new Error(`Asset does not exist: '${key}'`);
        }
        return this._store.get(key)!;
    }

    public set(key: string, value: T) {
        this._store.set(key, value);
    }
}

class _Assets implements IAssets {
    private _fontLoader = new FontLoader();
    private _fonts = new AssetPool<Font>();

    private _textureLoader = new TextureLoader();
    private _textures = new AssetPool<Texture>();

    private _spriteSheets = new AssetPool<SpriteSheet>();

    public get fonts() { return this._fonts; }
    public get textures() { return this._textures; }
    public get spriteSheets() { return this._spriteSheets; }

    public async loadFont(font: IFontData): Promise<Font> {
        if (font.data) {
            this.fonts.set(font.name, new Font(font.data));
        } else if (font.url) {
            this.fonts.set(font.name, await this._fontLoader.loadAsync(font.url));
        } else {
            throw new Error("Font data must have URL or data");
        }

        return this.fonts.get(font.name);
    }

    public async loadTexture(data: ITextureData): Promise<Texture> {
        const texture = await this._textureLoader.loadAsync(data.url);
        this.textures.set(data.name, texture);
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false;
        return this.textures.get(data.name);
    }

    public async loadSpriteSheet(data: ISpriteSheetData): Promise<SpriteSheet> {
        const texture = await this.loadTexture(data);
        const ss = new SpriteSheet(
            texture, 
            new Vector2(data.cells.x, data.cells.y),
            new Vector2(data.padding.x, data.padding.y),
            new Vector2(data.offset.x, data.offset.y)
        );
        this.spriteSheets.set(data.name, ss);
        
        return ss;
    }
}

export const Assets: IAssets = new _Assets();