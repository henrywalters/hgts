import { IScene } from "../../core/interfaces/scene";

export interface ISystem {
    onInit(): void;
    onStart(): void;
    onBeforeUpdate(): void;
    onUpdate(dt: number): void;
    onAfterUpdate(): void;
}

export type SystemCtr<T extends ISystem> = {
    new(scene: IScene): T;
}