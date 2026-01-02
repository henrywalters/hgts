import { Color } from "three";
import { Param, Types } from "../../core/reflection";
import { Component } from "../../ecs/component";

export enum PlayerStatus {
    Disconnected,
    Connected,
    Connecting,
}

export class Player extends Component {
    @Param({type: Types.Float})
    speed: number = 100;

    @Param({type: Types.Color})
    color: Color = new Color();
}