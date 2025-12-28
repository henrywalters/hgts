export class Object {
    private static currentId = 0;

    private _id: number;
    public get id() { return this._id };

    constructor(id?: number) {
        if (id) {
            this._id = id;
            Object.currentId = Math.max(id, Object.currentId);
        } else {
            this._id = Object.currentId;
        }
        Object.currentId += 1;
    }
}