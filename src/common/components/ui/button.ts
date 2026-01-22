import { Color } from "three";
import { Param, Types } from "../../../core/reflection";
import { Component } from "../../../ecs/component";
import { UIElement } from "./element";

export class Button extends UIElement {
    @Param({type: Types.Color})
    defaultColor = new Color(1, 1, 1);

    @Param({type: Types.Color})
    hoverColor = new Color(0.8, 0.8, 0.8);

    isHovering = false;

    isPressed = false;
    isJustPressed = false;
    isJustReleased = false;

    onClick?: () => void;

}