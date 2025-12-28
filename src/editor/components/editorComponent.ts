import EventListenerPool from "../../core/events";
import { IGame } from "../../core/interfaces/game";
import { IEditor } from "../interfaces/editor";

export class EditorComponent {
    private _editor: IEditor;

    public get editor() { return this._editor; }

    constructor(editor: IEditor) {
        this._editor = editor;
    }
}