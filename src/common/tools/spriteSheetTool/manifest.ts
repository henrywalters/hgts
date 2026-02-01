import { IManifest } from "../../../core/interfaces/manifest";
import { CameraPan, CameraZoom } from "../../components/camera";
import { FreeCamera } from "../../components/freeCamera";
import { CameraControllers } from "../../systems/cameraControllers";
import { Renderer } from "../../systems/renderer";
import { SpriteSheetTool } from "./scene";

export const SpriteSheetToolManifest: IManifest = {
    systems: [
        Renderer,
        CameraControllers,
    ],
    components: [
    ],
    scripts: [],
    scenes: {
        tool: {
            ctr: SpriteSheetTool,
            data: {
                entities: []
            }
        }
    },
    assets: {},
    startScene: "tool"
}