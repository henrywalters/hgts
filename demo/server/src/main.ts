import {Game} from "hgts/dist/core/game";
import {ServerDemo} from "hgts/dist/demos/server/server";
import {PongServerManifest} from "hgts/dist/demos/pongMultiplayer/server";
import { Clock } from "three";

(() => {

    const tickRate = 50;

    const game = new Game(new PongServerManifest(), true);

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