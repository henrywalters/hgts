import { Color } from "three";
import { Param, Types } from "../../../core/reflection";
import { Script } from "../../../core/script";
import { TextMesh } from "../../../common/components/mesh";
import { PongState, PongStates } from "../state";

export class RuntimeText extends Script {
    @Param({type: Types.Entity})
    status: number = -1;

    @Param({type: Types.Entity})
    score: number = -1;

    setText(id: number, message: string, color: Color = new Color(1, 1, 1)) 
    {
        const textEntity = this.entity.scene.getEntity(id);
        if (textEntity) {
            const text = textEntity.getComponent(TextMesh);
            if (text && (text.text !== message || text.color !== color)) {
                text.text = message;
                text.color = color;
                text.notifyUpdate();
            }
        } else {
            console.error("JoinGame doesn't have Entity");
        }
    }

    onUpdate(dt: number): void {
        const scoreText = `${PongState.scores[0].toFixed(0)} | ${PongState.scores[1].toFixed(0)}`;
        this.setText(this.score, scoreText);

        switch (PongState.state) {
            case PongStates.Playing:
                this.setText(this.status, "");
                break;
            case PongStates.Waiting:
                this.setText(this.status, "WAITING TO BEGIN...");
                break;
            case PongStates.Receiving:
                this.setText(this.status, "WAIT FOR OPPONENT TO SERVE");
                break;
            case PongStates.Serving:
                this.setText(this.status, "PRESS SPACE TO SERVE");
                break;
            case PongStates.GameOver:
                this.setText(this.status, PongState.gameOverMessage ? PongState.gameOverMessage : "GAME OVER");
        }
    }
}