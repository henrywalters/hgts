import { MeshPrimitive } from "../../common/components/mesh";
import { Renderer } from "../../common/systems/renderer";
import { IManifest, SceneManifest } from "../../core/interfaces/manifest";
import { ComponentCtr } from "../../ecs/interfaces/component";
import { Runtime } from "../pong/runtime";
import { ClientMessages, ServerMessages } from "./messages";
import { Player } from "./player";
import { ClientRuntime } from "./runtime";
import Sandbox from './scene.json'

export class ClientDemo implements IManifest {
    scenes = {
        sandbox: {
            data: Sandbox,
            ctr: ClientRuntime,
        }
    };
    startScene = "sandbox";
    components = [
        MeshPrimitive,
        Player,
    ];
    systems = [
        Renderer,
    ];
    scripts = [];
    assets = {
        fonts: [],
    };
    client = {
        address: {
            host: "localhost",
            port: 4200,
        },
        clientMessages: ClientMessages,
        serverMessages: ServerMessages,
    };
}