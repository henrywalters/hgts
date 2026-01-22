import { Param, Types } from "../core/reflection";
import { Component } from "../ecs/component";

export class TestComponent extends Component {
    @Param({type: Types.Entity})
    entityId: number = -1;
}