import { Object } from "./object";

export class Entity extends Object {

    public children: Entity[] = [];
    public name: string = "";

    constructor(name = "") {
        super();
        this.name = name;
    }
}