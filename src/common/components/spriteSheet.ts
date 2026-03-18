import { Assets } from "../../core/assets";
import { Boolean, Float, Int, Param, String } from "../../core/reflection";
import { Component } from "../../ecs/component";

export class SpriteSheet extends Component {
    @String()
    spriteSheet: string = "";

    @Boolean()
    animated: boolean = false;

    @Boolean()
    reverse: boolean = false;

    @Float()
    animationSpeed: number = 1.0;

    @Float()
    timeSinceTick: number = 0;

    @Int()
    index: number = 0;

    onFinish: () => void = () => {};

    public get finished() {
        if (!Assets.spriteSheets.has(this.spriteSheet)) {
            console.error(`Sprite sheet does not exist: '${this.spriteSheet}'`);
            return;
        }
        const ss = Assets.spriteSheets.get(this.spriteSheet);
        return this.reverse ? this.index === -1 : this.index === ss.cells.x * ss.cells.y;
    }

    public play() {
        this.reset();
        this.animated = true;
        this.notifyUpdate();
    }

    public resume() {
        this.animated = true;
        this.notifyUpdate();
    }

    public stop() {
        this.animated = false;
        this.notifyUpdate();
    }

    public reset() {
        if (!Assets.spriteSheets.has(this.spriteSheet)) {
            console.error(`Sprite sheet does not exist: '${this.spriteSheet}'`);
            return;
        }
        const ss = Assets.spriteSheets.get(this.spriteSheet);
        this.index = this.reverse ? ss.cells.x * ss.cells.y - 1 : 0;
    }

}