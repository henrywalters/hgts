import { ComponentCtr } from "../../ecs/interfaces/component";
import { SystemCtr } from "../../ecs/interfaces/system";
import { INetMessages } from "../../net/interfaces/messages";
import { INetAddress } from "../../net/interfaces/net";
import { IAssetsData } from "./assets";
import { SceneCtr, SceneData } from "./scene";
import { ScriptCtr } from "./script";

export interface SceneManifest {
    data: SceneData;
    ctr: SceneCtr<any>;
}

export interface INetManifest {
    address: INetAddress;
    clientMessages: INetMessages;
    serverMessages: INetMessages;
}

export interface IManifest {
    systems: SystemCtr<any>[];
    components: ComponentCtr<any>[];
    scripts: ScriptCtr<any>[];
    scenes: {[key: string]: SceneManifest};
    assets: IAssetsData;
    startScene: string;
    client?: INetManifest;
    server?: INetManifest;
}