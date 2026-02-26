import { Color } from "three";
import { Types } from "../../core/reflection";

export interface FullSelectOption {
    value: string;
    label: string;
}

export type SelectOption = string | FullSelectOption;

export interface InputOptions {
    type: Types;
    label?: string;
    subLabel?: string;
    width?: string;
}

export interface IHTMLGenerator {
    createButton(label: string, onClick: () => void): HTMLElement;
    createInput(options: InputOptions, value: string | number | void, onChange: (val: string | number) => void): HTMLElement;
    createCheckbox(label: string, value: boolean, onChange: (val: boolean) => void): HTMLElement;
    createSelect(label: string, value: string, options: SelectOption[], onChange: (val: string) => void): HTMLElement;
    createColorInput(label: string, value: Color, onChange: (val: Color) => void): HTMLElement;
}