import { Behavior } from "../../common/components/behavior";
import { FreeCamera } from "../../common/components/freeCamera";
import { MeshPrimitive } from "../../common/components/mesh";
import { CameraControllers } from "../../common/systems/cameraControllers";
import { Renderer } from "../../common/systems/renderer";
import { Scripts } from "../../common/systems/scripts";
import { IManifest } from "../../core/interfaces/manifest";
import { Runtime } from "../pong/runtime";
import Level1 from "./level1.json"

export class Rollerball implements IManifest {
    scenes = {
        level1: {
            data: Level1,
            ctr: Runtime,
        }
    }
    startScene = "level1";
    systems = [
        Renderer,
        Scripts,
        CameraControllers,
    ];
    scripts = [
    ];
    components = [
        Behavior,
        MeshPrimitive,
        FreeCamera,
    ];
    assets = {
        fonts: [],
    };
}