import EventListenerPool from "../../../core/events";
import { Param, Types } from "../../../core/reflection";
import { Text } from "./text";

export enum TextInputEvents {
    NewCharacter,
    Delete,
    Enter,
}

export class TextInput extends Text {

    @Param({type: Types.Int})
    maxLength: number = 16;

    events: EventListenerPool<TextInputEvents> = new EventListenerPool();

    addChar(char: string) {
        if (this.text.length < this.maxLength) {
            this.text += char;
            this.notifyUpdate();
        }
    }

    delete() {
        this.text = this.text.slice(0, -1);
        this.notifyUpdate();
    }
}