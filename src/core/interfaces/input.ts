import { Vector2 } from "three";

export enum Axes {
    MouseDelta,
    MousePosition,
    MouseWheel,
    KeyboardWASD,
    KeyboardDirectional,
}

export enum Buttons {
    MouseLeft,
    MouseMiddle,
    MouseRight,
    KeyA,
    KeyB,
    KeyC,
    KeyD,
    KeyE,
    KeyF,
    KeyG,
    KeyH,
    KeyI,
    KeyJ,
    KeyK,
    KeyL,
    KeyM,
    KeyN,
    KeyO,
    KeyP,
    KeyQ,
    KeyR,
    KeyS,
    KeyT,
    KeyU,
    KeyV,
    KeyW,
    KeyX,
    KeyY,
    KeyZ,
    KeyCtrl,
    KeyShift,
    KeyTab,
    KeySpace,
    KeyUp,
    KeyRight,
    KeyDown,
    KeyLeft,
}

export enum DeviceType {
    Mouse,
    Keyboard,
}

export type ButtonMap = Map<Buttons, Boolean>;
export type AxisMap = Map<Axes, Vector2>;

export interface IInputDevice {
    buttons: Buttons[];
    axes: Axes[];
    register(element: HTMLElement): void;
    getButton(button: Buttons): boolean;
    getAxis(axis: Axes): Vector2;

    update(): void;
}

export interface IInput {
    buttons: Map<Buttons, boolean>;
    buttonsPressed: Map<Buttons, boolean>;
    axes: Map<Axes, Vector2>;

    devices: Map<DeviceType, IInputDevice>;    

    update(): void;

    getAxis(axis: Axes): Vector2;
    getButton(button: Buttons): boolean;
    getButtonPressed(button: Buttons): boolean;
}