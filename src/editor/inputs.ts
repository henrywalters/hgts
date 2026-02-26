import { Color, Vector2, Vector3 } from "three";
import { Field, Reflection, Types } from "../core/reflection";
import { ScriptRegistry } from "../core/script";
import { IScene } from "../core/interfaces/scene";
import { IEntity } from "../ecs/interfaces/entity";
import { IHTMLGenerator, SelectOption } from "../html/interfaces/html";
import { ShoelaceHTMLGenerator } from "../html/shoelace";

export function makeVector2(generator: IHTMLGenerator, label: string, value: Vector2, onChange: (value: Vector2) => void) {
    const root = document.createElement('div');
    const container = document.createElement('div');
    container.style.display = 'flex';

    const text = document.createElement('h4');
    text.innerHTML = label;

    root.appendChild(text);
    root.appendChild(container);

    container.appendChild(generator.createInput(
        { label: 'X', type: Types.Float, width: '50%'}, value.x, (val: any) => {
            value.setX(val);
            onChange(value);
        }
    ));

    container.appendChild(generator.createInput(
        { label: 'Y', type: Types.Float, width: '50%'}, value.y, (val: any) => {
            value.setY(val);
            onChange(value);
        }
    ));

    return root;
}

export function makeVector3(generator: IHTMLGenerator, label: string, value: Vector3, onChange: (value: Vector3) => void) {
    const root = document.createElement('div');
    const container = document.createElement('div');
    container.style.marginTop = '5px';
    container.style.display = 'flex';

    const text = document.createElement('h4');
    text.innerHTML = label;

    root.appendChild(text);
    root.appendChild(container);

    container.appendChild(generator.createInput(
        { label: 'X', type: Types.Float, width: '33%'}, value.x, (val: any) => {
            value.setX(val);
            onChange(value);
        }
    ));

    container.appendChild(generator.createInput(
        { label: 'Y', type: Types.Float, width: '33%'}, value.y, (val: any) => {
            value.setY(val);
            onChange(value);
        }
    ));

    container.appendChild(generator.createInput(
        { label: 'Z', type: Types.Float, width: '33%'}, value.z, (val: any) => {
            value.setZ(val);
            onChange(value);
        }
    ));

    return root;
}

export function makeClassInput(generator: IHTMLGenerator, scene: IScene, label: string, obj: any, onChange: (value: any) => void) {
    const root = document.createElement('div');

    const labelEl = document.createElement('h4');
    labelEl.innerText = label;

    root.appendChild(labelEl);

    for (const [key, param] of Reflection.getParams(obj)) {
        root.appendChild(makeInput(scene, obj, key, param, (value) => {
            obj[key] = value;
            onChange(obj);
        }, generator));
    }

    return root;
}

export function makeArrayInput(generator: IHTMLGenerator, scene: IScene, field: Field, label: string, value: any[], onChange: (value: any[]) => void) {
    const root = document.createElement('div');

    const labelEl = document.createElement('h4');
    labelEl.innerText = label;

    const addNew = document.createElement('sl-button');
    addNew.innerText = 'Add Item';

    root.appendChild(labelEl);
    root.appendChild(addNew);

    const items = document.createElement('div');

    const addItem = (idx: number, item: any) => {
        console.log(value, idx);
        items.appendChild(makeInput(scene, value, idx, {type: field.subType!, ctr: field.ctr}, (val) => {
            value[idx] = val;
            onChange(value);
        }, generator))
    }

    for (let i = 0; i < value.length; i++) {
        addItem(i, value[i]);
    }

    root.appendChild(items);

    addNew.addEventListener('click', () => {
        if (field.subType === Types.Class) {
            if (!field.ctr) {
                throw new Error(`Class Subtype requires ctr parameter`);
            }
            const newObj = new field.ctr();
            value.push(newObj);
            addItem(value.length - 1, newObj);
            onChange(value);
        }
    });

    return root;
}

export function makeEnumInput(label: string, value: any, en: Object, onChange: (value: any) => void, generator: IHTMLGenerator) {
    const options: SelectOption[] = [];
    for (const entry of Object.entries(en)) {
        options.push(entry[1]);
    }
    return generator.createSelect(label, value, options, onChange);
}

export function makeInput(scene: IScene, object: any, key: string | number, field: Field, onChange: (val: any) => void, generator: IHTMLGenerator = new ShoelaceHTMLGenerator()) {
    const div = document.createElement('div');
    div.classList.add('input-group');

    const label = field.label ? field.label : key.toString();

    const change = (value: any) => {
        object[key] = value;
        onChange(value);
    }

    if (field.type === Types.String || field.type === Types.Int || field.type === Types.Float) {
        div.appendChild(
            generator.createInput({
                type: field.type,
                label: label,
                subLabel: field.description,
            }, object[key], change));
    } else if (field.type === Types.Boolean) {
        div.appendChild(generator.createCheckbox(label, object[key], change));
    } else if (field.type === Types.Vector2) {
        div.appendChild(makeVector2(generator, label, object[key], change));
    } else if (field.type === Types.Vector3) {
        div.appendChild(makeVector3(generator, label, object[key], change));
    } else if (field.type === Types.Color) {
        div.appendChild(generator.createColorInput(label, object[key], change));
    } else if (field.type === Types.Enum) {
        if (!field.enum) {
            throw new Error("Enum type expects enum parameter");
        }
        div.appendChild(makeEnumInput(label, object[key], field.enum, change, generator));
    } else if (field.type === Types.Script) {
        const options: string[] = [];
        for (const key of ScriptRegistry.registry.keys()) {
            options.push(key);
        }
        div.appendChild(generator.createSelect(label, object[key], options, change));
    } else if (field.type === Types.Entity) {
        const options: SelectOption[] = [];
        scene.forEachEntity((entity) => {
            options.push({
                label: entity.name,
                value: entity.id.toFixed(0),
            })
        })
        div.appendChild(generator.createSelect(label, object[key], options, change));
    } else if (field.type === Types.Class) {
        div.appendChild(makeClassInput(generator, scene, label, object[key], change));  
    } else if (field.type === Types.Array) { 
        div.appendChild(makeArrayInput(generator, scene, field, label, object[key], change));
    } else {
        throw new Error(`Unsupported field type: ${field.type}`);
    }

    return div;
}