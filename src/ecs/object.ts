export class Object {
    private static currentId = 0;

    private _id: number;
    public get id() { return this._id };

    constructor() {
        this._id = Object.currentId;
        Object.currentId += 1;
    }
}