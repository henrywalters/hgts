import { Texture } from "three";
import { IAssetPool, IAssets, IFontData } from "./interfaces/assets";
import { Font, FontData, FontLoader } from "three/examples/jsm/Addons.js";

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

    public get fonts() { return this._fonts; }

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
}

export const Assets: IAssets = new _Assets();