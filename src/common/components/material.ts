import { Color } from "three";
import { Param, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";

export class BasicMaterial extends Component {
    @Param({type: Types.Color})
    color: Color = new Color('black');
}