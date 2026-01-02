import { Font, FontData } from "three/examples/jsm/Addons.js";

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

export interface IAssetsData {
    fonts?: IFontData[];
}

export interface IAssets {
    fonts: IAssetPool<Font>;

    loadFont(data: IFontData): Promise<Font>;
}

