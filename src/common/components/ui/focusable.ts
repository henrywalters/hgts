import { Param, Types } from "../../../core/reflection";
import { Component } from "../../../ecs/component";
import { UIElement } from "./element";

export class Focusable extends UIElement {
    @Param({type: Types.Boolean})
    focused: boolean = false;
}