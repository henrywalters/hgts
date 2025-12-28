import { ComponentCtr } from "../../ecs/interfaces/component";
import { SystemCtr } from "../../ecs/interfaces/system";
import { SceneCtr, SceneData } from "./scene";
import { ScriptCtr } from "./script";

export interface SceneManifest {
    data: SceneData;
    ctr: SceneCtr<any>;
}

export interface IManifest {
    systems: SystemCtr<any>[];
    components: ComponentCtr<any>[];
    scripts: ScriptCtr<any>[];
    scenes: {[key: string]: SceneManifest};
    startScene: string;
}