import { FontData } from "three/examples/jsm/Addons.js";
import { IManifest } from "../../core/interfaces/manifest";
import DefaultFont from "./fonts/8bit.json";
import RSFont from "./fonts/RuneScape_Regular.json";
import { UIMenu } from "./menu";
import { Renderer } from "../../common/systems/renderer";
import MenuScene from "./scenes/menu.json";
import { UI } from "../../common/systems/ui";

export const UIManifest: IManifest = {
    systems: [
        Renderer,
        UI,
    ],
    components: [

    ],
    scripts: [],
    scenes: {
        menu: {
            data: {
                entities: [],
            },
            ctr: UIMenu,
        }
    },
    assets: {
        fonts: [

            {
                name: 'runescape',
                data: RSFont as unknown as FontData,
            }
        ]
    },
    startScene: "menu"
}