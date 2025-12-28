import { Param, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";

export class BasicMaterial extends Component {
    @Param({type: Types.Color})
    color: string = 'black';
}