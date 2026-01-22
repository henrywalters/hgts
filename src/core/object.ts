import { generateId } from "../utils/id";

export class HGObject {

    private _id: number;
    public get id() { return this._id };

    constructor(id?: number) {
        if (id) {
            this._id = id;
        } else {
            this._id = generateId(12);
        }
    }
}