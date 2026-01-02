import { IManifest } from "../../core/interfaces/manifest";
import { ClientMessages, ServerMessages } from "./messages";
import { Player } from "./player";
import { ServerRuntime } from "./runtime";
import Sandbox from './scene.json'

export class ServerDemo implements IManifest {
    scenes = {
        sandbox: {
            data: {entities: []},
            ctr: ServerRuntime,
        }
    };
    startScene = "sandbox";
    components = [
        Player,
    ];
    systems = [];
    scripts = [];
    assets = {
        fonts: [],
    };
    server = {
        address: {
            host: "localhost",
            port: 4200,
        },
        clientMessages: ClientMessages,
        serverMessages: ServerMessages,
    };
}