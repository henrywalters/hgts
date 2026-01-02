export class HGObject {
    private static currentId = 0;

    private _id: number;
    public get id() { return this._id };

    constructor(id?: number) {
        if (id) {
            this._id = id;
            HGObject.currentId = Math.max(id, HGObject.currentId);
        } else {
            this._id = HGObject.currentId;
        }
        HGObject.currentId += 1;
    }
}