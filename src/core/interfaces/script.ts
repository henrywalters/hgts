import { IComponent } from "../../ecs/interfaces/component";

export interface IScript {
    onStart(): void;
    onBeforeUpdate(): void;
    onUpdate(dt: number): void;
    onAfterUpdate(): void;
}

export type ScriptCtr<T extends IScript> = {
    new (component: IComponent): IScript;
    name: string;
}