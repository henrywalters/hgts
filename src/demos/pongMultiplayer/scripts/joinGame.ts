import { Color } from "three";
import { TextMesh } from "../../../common/components/mesh";
import { Button } from "../../../common/components/ui/button";
import { Param, Types } from "../../../core/reflection";
import { Script } from "../../../core/script";
import { ClientMessages, JoinGameRequest } from "../messages";
import { PongMenuState, PongMenuStates } from "../state";

interface JoinStatus {
    color: Color;
    message: string;
}

const Statuses = {
    [PongMenuStates.Disconnected]: {
        color: new Color(1, 0, 0),
        message: 'DISCONNECTED FROM SERVER',
    },
    [PongMenuStates.Waiting]: {
        color: new Color(0, 0, 1),
        message: "WAITING FOR PLAYER...",
    },
    [PongMenuStates.Connected]: {
        color: new Color(0, 1, 0),
        message: 'CONNECTED TO SERVER',
    }
}

export class JoinGame extends Script {

    @Param({type: Types.Entity})
    text: number = -1;

    onUpdate(dt: number): void {

        const button = this.entity.getComponent(Button);
        
        if (button && button.isJustReleased) {
            PongMenuState.state = PongMenuStates.Waiting;
            this.game.client.socket.send(ClientMessages.write(new JoinGameRequest()));
        }

        const textEntity = this.entity.scene.getEntity(this.text);
        if (!textEntity) {
            console.error("JoinGame doesn't have Entity");
            return;
        }

        const text = textEntity.getComponent(TextMesh);
        if (!text) {
            console.error(`Entity ${textEntity.name} doesn't have TextMesh`);
            return;
        }

        if (text.text !== Statuses[PongMenuState.state].message) {
            text.text = Statuses[PongMenuState.state].message;
            text.color = Statuses[PongMenuState.state].color;
            text.notifyUpdate();
        }
    }
}