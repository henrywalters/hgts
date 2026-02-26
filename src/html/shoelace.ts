import { Color } from "three";
import { IHTMLGenerator, InputOptions, SelectOption } from "./interfaces/html";
import { Types } from "../core/reflection";

export class ShoelaceHTMLGenerator implements IHTMLGenerator {
    createButton(label: string, onClick: () => void): HTMLElement {
        const btn = document.createElement('sl-button');
        btn.innerHTML = label;
        btn.addEventListener('click', (e) => {
            onClick();
        });
        return btn;
    }
    createInput(options: InputOptions, value: string | number | void, onChange: (val: string | number) => void): HTMLElement {

        const input = document.createElement('sl-input');
        if (options.label) {
            input.setAttribute('label', options.label);
        }
        if (value !== undefined) {
            input.setAttribute('value', value.toString());
        }
    
        if (options.subLabel) {
            input.setAttribute('help-text', options.subLabel);
        }
    
        if (options.width) {
            input.style.width = options.width;
        }
        
        if (options.type === Types.Float || options.type === Types.Int) {
            // @ts-ignore
            input.type = 'number';
        }
    
        input.addEventListener('sl-input', (e) => {
            // @ts-ignore
            let value: any = input.value;
    
            if (options.type === Types.Float) {
                value = parseFloat(value);
            } else if (options.type === Types.Int) {
                value = parseInt(value);
            }
    
            onChange(value);
        });
    
        return input;
    }
    createCheckbox(label: string, value: boolean, onChange: (val: boolean) => void): HTMLElement {
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
    createSelect(label: string, value: string, options: SelectOption[], onChange: (val: string) => void): HTMLElement {
        const root = document.createElement('div');

        const labelEl = document.createElement('h4');
        labelEl.innerText = label;

        const input = document.createElement('sl-select');

        console.log(value);

        for (const option of options) {
            const opt = document.createElement('sl-option');
            if (typeof option === 'string') {
                opt.setAttribute('value', option);
                opt.innerHTML = option;
            } else {
                opt.setAttribute('value', option.value);
                opt.innerHTML = option.label;
            }
            input.appendChild(opt);
        }

        input.addEventListener('sl-input', (e) => {
            // @ts-ignore
            onChange(input.value);
        })

        root.appendChild(labelEl);
        root.appendChild(input);

        input.setAttribute('value', value);

        return root;
    }
    createColorInput(label: string, value: Color, onChange: (val: Color) => void): HTMLElement {
        const root = document.createElement('div');

        const labelEl = document.createElement('h4');
        labelEl.innerText = label;

        const input = document.createElement('sl-color-picker');

        // @ts-ignore
        input.value = value.getHex();

        input.addEventListener('sl-input', (e) => {
            // @ts-ignore
            onChange(new Color(input.value));
        })

        root.appendChild(labelEl);
        root.appendChild(input);

        return root;
    }

}