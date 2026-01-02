import {Game} from "hagamets/dist/core/game";
import {ServerDemo} from "hagamets/dist/demos/server/server";
import {PongServerManifest} from "hagamets/dist/demos/pongMultiplayer/server";
import { Clock } from "three";

(() => {

    const tickRate = 50;

    const manifest = new PongServerManifest();

    const game = new Game(manifest, true);

    const clock = new Clock();

    const tick = () => {

        const start = clock.getElapsedTime();

        game.tick(true);

        const end = clock.getElapsedTime();

        const duration = (end - start) * 1000;

        if (duration > tickRate) {
            console.warn("Server Duration exceeding tickRate");
        };

        const waitFor = duration > tickRate ? 0 : tickRate - duration;

        setTimeout(tick, waitFor);
    }

    tick();

})();