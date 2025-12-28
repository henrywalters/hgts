import { Param, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";

export class Behavior extends Component {
    @Param({type: Types.Script})
    scriptName: string = '';
}