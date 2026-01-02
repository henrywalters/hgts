import { ComponentContainer } from "golden-layout";
import { IEditorComponent } from "../interfaces/editorComponent";
import { IGame } from "../../core/interfaces/game";
import { EditorComponent } from "./editorComponent";
import { Vector2 } from "three";
import { IEditor } from "../interfaces/editor";

export class GameView extends EditorComponent implements IEditorComponent {

    size?: Vector2;

    constructor(editor: IEditor, size?: Vector2) {
        super(editor);
        this.size = size;
    }

    render(container: ComponentContainer, state: any): void {
        const canvas = this.editor.game.renderer.domElement;
        if (this.size) {
            canvas.style.width = `${this.size.x}px`;
            canvas.style.height = `${this.size.y}px`;

            this.editor.game.resize(this.size.x, this.size.y);

            console.log(this.size);
        } else {
            canvas.style.width = '100%';
            canvas.style.height = '100%';

            const resize = () => {
                const { width, height } = container.element.getBoundingClientRect();
                this.editor.game.resize(width, height);
            }

            container.on('resize', resize);

            resize();
        }

        canvas.style.display = 'block';

        container.element.appendChild(canvas);
    }
}