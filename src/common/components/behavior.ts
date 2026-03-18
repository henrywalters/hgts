import { Param, Types } from "../../core/reflection";
import { ScriptRegistry } from "../../core/script";
import { Component } from "../../ecs/component";

export class Behavior extends Component {
    @Param({type: Types.Script})
    scriptName: string = '';

    public get script() {
        return ScriptRegistry.get(this.scriptName, this);
    }
}