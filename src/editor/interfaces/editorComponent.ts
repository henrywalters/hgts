import { ComponentContainer } from "golden-layout";

export interface IEditorComponent {
    render(container: ComponentContainer, state: any): void;
}