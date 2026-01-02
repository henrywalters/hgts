import { Param, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";

export class PongPaddle extends Component {

    @Param({type: Types.Int})
    serverId: number = -1;

    @Param({type: Types.Float})
    padding: number = 30;

    @Param({type: Types.Float})
    speed: number = 100;

    @Param({type: Types.Boolean})
    isPlayerOne: boolean = false;
}