import { Float, Param, String, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";

export class Animation {
    @String()
    name: string = "";

    @String()
    animation: string = "";

    @Float()
    animationRate = 1.0;
}

export class Animations extends Component {

    @String()
    animation: string = "";

    @Param({type: Types.Array, ctr: Animation, subType: Types.Class})
    animations: Animation[] = [];

    public get currentAnimation() {
        for (const animation of this.animations) {
            if (animation.name === this.animation) return animation;
        }
        return null;
    }
}