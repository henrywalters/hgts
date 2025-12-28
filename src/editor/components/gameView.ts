import { ComponentContainer } from "golden-layout";
import { IEditorComponent } from "../interfaces/editorComponent";
import { IGame } from "../../core/interfaces/game";
import { EditorComponent } from "./editorComponent";

export class GameView extends EditorComponent implements IEditorComponent {

    render(container: ComponentContainer, state: any): void {
        const canvas = this.editor.game.renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';

        container.element.appendChild(canvas);

        const resize = () => {
            const { width, height } = container.element.getBoundingClientRect();
            this.editor.game.resize(width, height);
        }

        container.on('resize', resize);

        resize();
    }
}