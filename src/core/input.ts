import { Vector2 } from "three";
import { Axes, Buttons, DeviceType, IInput, IInputDevice } from "./interfaces/input";

class InputDevice {
    protected buttonMap: Map<Buttons, boolean> = new Map();
    protected axesMap: Map<Axes, Vector2> = new Map();

    getButton(button: Buttons) {
        return this.buttonMap.get(button)!;
    }

    getAxis(axis: Axes) {
        return this.axesMap.get(axis)!;
    }
}

export class Keyboard extends InputDevice implements IInputDevice {
    
    public buttons = [
        Buttons.KeyA,
        Buttons.KeyB,
        Buttons.KeyC,
        Buttons.KeyD,
        Buttons.KeyE,
        Buttons.KeyF,
        Buttons.KeyG,
        Buttons.KeyH,
        Buttons.KeyI,
        Buttons.KeyJ,
        Buttons.KeyK,
        Buttons.KeyL,
        Buttons.KeyM,
        Buttons.KeyN,
        Buttons.KeyO,
        Buttons.KeyP,
        Buttons.KeyQ,
        Buttons.KeyR,
        Buttons.KeyS,
        Buttons.KeyT,
        Buttons.KeyU,
        Buttons.KeyV,
        Buttons.KeyW,
        Buttons.KeyX,
        Buttons.KeyY,
        Buttons.KeyZ,
        Buttons.KeyCtrl,
        Buttons.KeyShift,
        Buttons.KeyTab,
        Buttons.KeySpace,
        Buttons.KeyUp,
        Buttons.KeyRight,
        Buttons.KeyDown,
        Buttons.KeyLeft,
    ];

    public axes = [
        Axes.KeyboardWASD,
        Axes.KeyboardDirectional,
    ];

    private KeyCodeToButton: {[key: string]: Buttons} = {
        // Letters
        KeyA: Buttons.KeyA,
        KeyB: Buttons.KeyB,
        KeyC: Buttons.KeyC,
        KeyD: Buttons.KeyD,
        KeyE: Buttons.KeyE,
        KeyF: Buttons.KeyF,
        KeyG: Buttons.KeyG,
        KeyH: Buttons.KeyH,
        KeyI: Buttons.KeyI,
        KeyJ: Buttons.KeyJ,
        KeyK: Buttons.KeyK,
        KeyL: Buttons.KeyL,
        KeyM: Buttons.KeyM,
        KeyN: Buttons.KeyN,
        KeyO: Buttons.KeyO,
        KeyP: Buttons.KeyP,
        KeyQ: Buttons.KeyQ,
        KeyR: Buttons.KeyR,
        KeyS: Buttons.KeyS,
        KeyT: Buttons.KeyT,
        KeyU: Buttons.KeyU,
        KeyV: Buttons.KeyV,
        KeyW: Buttons.KeyW,
        KeyX: Buttons.KeyX,
        KeyY: Buttons.KeyY,
        KeyZ: Buttons.KeyZ,

        // Modifiers
        ControlLeft: Buttons.KeyCtrl,
        ControlRight: Buttons.KeyCtrl,

        ShiftLeft: Buttons.KeyShift,
        ShiftRight: Buttons.KeyShift,

        // Navigation / misc
        Tab: Buttons.KeyTab,
        Space: Buttons.KeySpace,

        ArrowUp: Buttons.KeyUp,
        ArrowRight: Buttons.KeyRight,
        ArrowDown: Buttons.KeyDown,
        ArrowLeft: Buttons.KeyLeft,
        };

    register(element: HTMLElement): void {
        document.addEventListener('keyup', (e) => {
            if (this.KeyCodeToButton[e.code]) {
                this.buttonMap.set(this.KeyCodeToButton[e.code], false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.KeyCodeToButton[e.code]) {
                this.buttonMap.set(this.KeyCodeToButton[e.code], true);
            }
        });
    }

    private getDirectional(left: boolean, right: boolean) {
        if ((left && right) || (!left && !right)) return 0;
        return left ? -1 : 1;
    }

    update(): void {
        this.axesMap.set(Axes.KeyboardWASD, new Vector2(
            this.getDirectional(this.getButton(Buttons.KeyA), this.getButton(Buttons.KeyD)),
            this.getDirectional(this.getButton(Buttons.KeyS), this.getButton(Buttons.KeyW)),
        ));

        this.axesMap.set(Axes.KeyboardDirectional, new Vector2(
            this.getDirectional(this.getButton(Buttons.KeyLeft), this.getButton(Buttons.KeyRight)),
            this.getDirectional(this.getButton(Buttons.KeyDown), this.getButton(Buttons.KeyUp)),
        ));
    }
    
}

export class Mouse extends InputDevice implements IInputDevice  {

    private _tmpPos = new Vector2();
    private _tmpWheel = new Vector2();

    private _pos = new Vector2();
    private _delta = new Vector2();

    public get pos() { return this._pos; }
    public get delta() { return this._delta; }
    
    public buttons = [Buttons.MouseLeft, Buttons.MouseMiddle, Buttons.MouseRight];
    public axes = [Axes.MouseDelta, Axes.MousePosition, Axes.MouseWheel];

    register(element: HTMLElement): void {

        this.buttonMap.set(Buttons.MouseLeft, false);
        this.buttonMap.set(Buttons.MouseMiddle, false);
        this.buttonMap.set(Buttons.MouseRight, false);

        this.axesMap.set(Axes.MouseDelta, new Vector2());
        this.axesMap.set(Axes.MousePosition, new Vector2());
        this.axesMap.set(Axes.MouseWheel, new Vector2());

        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        element.addEventListener('mousewheel', (e) => {
            // @ts-ignore
            const x = e.deltaX === 0 ? 0 : Math.sign(e.deltaX);
            // @ts-ignore
            const y = e.deltaY === 0 ? 0 : Math.sign(e.deltaY);
            this._tmpWheel = new Vector2(x, y);
        })

        element.addEventListener('mouseup', (e) => {
            switch(e.button) {
                case 0:
                    this.buttonMap.set(Buttons.MouseLeft, false);
                    break;
                case 1:
                    this.buttonMap.set(Buttons.MouseMiddle, false);
                    break;
                case 2:
                    this.buttonMap.set(Buttons.MouseRight, false);
                    break;
            }
        });

        element.addEventListener('mousedown', (e) => {
            switch(e.button) {
                case 0:
                    this.buttonMap.set(Buttons.MouseLeft, true);
                    break;
                case 1:
                    this.buttonMap.set(Buttons.MouseMiddle, true);
                    break;
                case 2:
                    this.buttonMap.set(Buttons.MouseRight, true);
                    break;
            }
        });

        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const newPos = new Vector2(e.x - rect.left, e.y - rect.top);
            this._tmpPos = newPos;
        });
    }

    update(): void {
        this._delta.subVectors(this._tmpPos, this.pos);
        this._pos.copy(this._tmpPos);
        this.axesMap.set(Axes.MouseWheel, this._tmpWheel);
        this._tmpWheel = new Vector2();
        this.axesMap.set(Axes.MouseDelta, this.delta);
        this.axesMap.set(Axes.MousePosition, this.pos);
    }
}

export class Input implements IInput {

    public buttons: Map<Buttons, boolean> = new Map();
    public buttonsPressed: Map<Buttons, boolean> = new Map();
    public axes: Map<Axes, Vector2> = new Map();

    public devices: Map<DeviceType, IInputDevice> = new Map();    

    constructor(element: HTMLElement) {
        this.devices.set(DeviceType.Mouse, new Mouse());
        this.devices.set(DeviceType.Keyboard, new Keyboard());

        for (const [type, device] of this.devices) {
            device.register(element);
        }
        // this.keyboard.register(element);
    }

    getAxis(axis: Axes): Vector2 {
        if (!this.axes.has(axis)) {
            throw new Error(`Axis ${axis} does not exist`);
        }
        return this.axes.get(axis)!;
    }
    getButton(button: Buttons): boolean {
        if (!this.buttons.has(button)) return false;
        return this.buttons.get(button)!;
    }
    getButtonPressed(button: Buttons): boolean {
        if (!this.buttonsPressed.has(button)) return false;
        return this.buttonsPressed.get(button)!;
    }

    update() {
        for (const [type, device] of this.devices) {

            device.update();

            for (const button of device.buttons) {
                const pressed = device.getButton(button);
                const state = this.buttons.get(button);
                this.buttonsPressed.set(button, pressed && !state);
                this.buttons.set(button, pressed);
            }

            for (const axis of device.axes) {
                this.axes.set(axis, device.getAxis(axis));
            }
        }
    }
}