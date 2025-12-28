import { Behavior } from "../../common/components/behavior";
import { MeshPrimitive } from "../../common/components/mesh";
import { Renderer } from "../../common/systems/renderer";
import { Scripts } from "../../common/systems/scripts";
import { IManifest } from "../../core/interfaces/manifest";
import { Ball } from "./ball";
import { ComputerPaddle } from "./computerPaddle";
import { PlayerPaddle } from "./playerPaddle";
import { Runtime } from "./runtime";
import PongData from "./scene.json";

export class Pong implements IManifest {
    scenes = {
        game: {
            data: PongData,
            ctr: Runtime,
        }
    }
    startScene = "game";
    systems = [
        Renderer,
        Scripts,
    ];
    scripts = [
        PlayerPaddle,
        ComputerPaddle,
        Ball,
    ];
    components = [
        Behavior,
        MeshPrimitive,
    ];
}