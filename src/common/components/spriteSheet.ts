import { Boolean, Float, Int, Param, String } from "../../core/reflection";
import { Component } from "../../ecs/component";

export class SpriteSheet extends Component {
    @String()
    spriteSheet: string = "";

    @Boolean()
    animated: boolean = false;

    @Float()
    animationSpeed: number = 1.0;

    @Float()
    timeSinceTick: number = 0;

    @Int()
    index: number = 0;
}