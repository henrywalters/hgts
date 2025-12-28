import { Vector2, Vector3 } from "three";
import { Field, Types } from "../core/reflection";
import { ScriptRegistry } from "../core/script";
import { IScene } from "../core/interfaces/scene";
import { IEntity } from "../ecs/interfaces/entity";

export function makeSimpleInput(label: string | null, field: Field, value: any, onChange: (value: any) => void, width?: string) {
    const input = document.createElement('sl-input');
    if (label) {
        input.setAttribute('label', label);
    }
    input.setAttribute('value', value);

    if (field.description) {
        input.setAttribute('help-text', field.description);
    }

    if (width) {
        input.style.width = width;
    }
    
    if (field.type === Types.Float || field.type === Types.Int) {
        // @ts-ignore
        input.type = 'number';
    }

    input.addEventListener('sl-input', (e) => {
        // @ts-ignore
        let value: any = input.value;

        if (field.type === Types.Float) {
            value = parseFloat(value);
        } else if (field.type === Types.Int) {
            value = parseInt(value);
        }

        onChange(value);
    });

    return input;
}

export function makeBooleanInput(label: string, value: boolean, onChange: (value: boolean) => void) {
    const input = document.createElement('sl-checkbox');
    input.innerText = label;

    // @ts-ignore
    input.checked = value;

    input.addEventListener('sl-input', (e) => {
        // @ts-ignore
        onChange(input.checked ? true : false);
    })

    return input;
}

export function makeVector2(label: string, value: Vector2, onChange: (value: Vector2) => void) {
    const root = document.createElement('div');
    const container = document.createElement('div');
    container.style.display = 'flex';

    const text = document.createElement('h4');
    text.innerHTML = label;

    root.appendChild(text);
    root.appendChild(container);

    container.appendChild(makeSimpleInput('X', {type: Types.Float}, value.x, (val) => {
        value.setX(val);
        onChange(value);
    }, '50%'));

    container.appendChild(makeSimpleInput('Y', {type: Types.Float}, value.y, (val) => {
        value.setY(val);
        onChange(value);
    }, '50%'));

    return root;
}

export function makeVector3(label: string, value: Vector3, onChange: (value: Vector3) => void) {
    const root = document.createElement('div');
    const container = document.createElement('div');
    container.style.marginTop = '5px';
    container.style.display = 'flex';

    const text = document.createElement('h4');
    text.innerHTML = label;

    root.appendChild(text);
    root.appendChild(container);

    container.appendChild(makeSimpleInput('X', {type: Types.Float}, value.x, (val) => {
        value.setX(val);
        onChange(value);
    }, '33%'));

    container.appendChild(makeSimpleInput('Y', {type: Types.Float}, value.y, (val) => {
        value.setY(val);
        onChange(value);
    }, '33%'));

    container.appendChild(makeSimpleInput('Z', {type: Types.Float}, value.z, (val) => {
        value.setZ(val);
        onChange(value);
    }, '33%'));

    return root;
}

export function makeColorInput(label: string, color: string, onChange: (value: Vector3) => void) {
    const root = document.createElement('div');

    const labelEl = document.createElement('h4');
    labelEl.innerText = label;

    const input = document.createElement('sl-color-picker');

    // @ts-ignore
    input.value = color;

    input.addEventListener('sl-input', (e) => {
        // @ts-ignore
        onChange(input.value);
    })

    root.appendChild(labelEl);
    root.appendChild(input);

    return root;
}

export function makeSelectInput(label: string, options: any, value: any, onChange: (value: any) => void) {
    const root = document.createElement('div');

    const labelEl = document.createElement('h4');
    labelEl.innerText = label;

    const input = document.createElement('sl-select');

    for (const option of options) {
        const opt = document.createElement('sl-option');
        opt.setAttribute('value', option);
        opt.innerHTML = option;
        input.appendChild(opt);
    }

    // @ts-ignore
    input.value = value;

    input.addEventListener('sl-input', (e) => {
        // @ts-ignore
        onChange(input.value);
    })

    root.appendChild(labelEl);
    root.appendChild(input);

    return root;
}

export function makeEntitySelectInput(scene: IScene, label: string, value: number, onChange: (value: IEntity | null) => void) {
    const root = document.createElement('div');

    const labelEl = document.createElement('h4');
    labelEl.innerText = label;

    const input = document.createElement('sl-select');

    for (const entity of scene.entities) {
        const opt = document.createElement('sl-option');
        opt.setAttribute('value', entity.id.toFixed(0));
        opt.innerHTML = entity.name;
        input.appendChild(opt);
    }

    input.addEventListener('sl-input', (e) => {
        // @ts-ignore
        console.log(input.value);
        // @ts-ignore
        onChange(parseInt(input.value));
    })

    if (value >= 0) {
        input.setAttribute('value', value.toFixed(0));
    }

    root.appendChild(labelEl);
    root.appendChild(input);

    return root;
}

export function makeInput(scene: IScene, object: any, key: string, field: Field, onChange: (val: any) => void) {
    const div = document.createElement('div');
    div.classList.add('input-group');

    const label = field.label ? field.label : key;

    const change = (value: any) => {
        object[key] = value;
        onChange(value);
    }

    if (field.type === Types.String || field.type === Types.Int || field.type === Types.Float) {
        const labelEl = document.createElement('h4');
        labelEl.innerText = label;
        div.appendChild(labelEl);
        div.appendChild(makeSimpleInput(null, field, object[key], change));
    } else if (field.type === Types.Boolean) {
        div.appendChild(makeBooleanInput(label, object[key], change));
    } else if (field.type === Types.Vector2) {
        div.appendChild(makeVector2(label, object[key], change));
    } else if (field.type === Types.Vector3) {
        div.appendChild(makeVector3(label, object[key], change));
    } else if (field.type === Types.Color) {
        div.appendChild(makeColorInput(label, object[key], change));
    } else if (field.type === Types.Enum) {
        if (!field.enum) {
            throw new Error("Enum type expects enum parameter");
        }
        div.appendChild(makeSelectInput(label, Object.keys(field.enum), object[key], change));
    } else if (field.type === Types.Script) {
        div.appendChild(makeSelectInput(label, ScriptRegistry.registry.keys(), object[key], change));
    } else if (field.type === Types.Entity) {
        div.appendChild(makeEntitySelectInput(scene, label, object[key], change));
    } else {
        throw new Error(`Unsupported field type: ${field.type}`);
    }

    return div;
}