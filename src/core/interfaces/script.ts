import { IComponent } from "../../ecs/interfaces/component";
import { IParameterizable } from "../reflection";

export interface IScript extends IParameterizable {
    onStart(): void;
    onBeforeUpdate(): void;
    onUpdate(dt: number): void;
    onAfterUpdate(): void;
}

export type ScriptCtr<T extends IScript> = {
    new (component: IComponent): IScript;
    name: string;
}