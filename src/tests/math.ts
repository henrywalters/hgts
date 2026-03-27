import { Vector2 } from "three";
import { ITest } from "../utils/test";
import { bresenham } from "../utils/math";

export const LINE_TEST: ITest = {
    expected: [
        new Vector2(0, 0),
        new Vector2(1, 1),
        new Vector2(2, 2),
        new Vector2(3, 3),
    ],
    run: function () {
        const out = bresenham(new Vector2(0, 0), new Vector2(3, 3));
        console.log(out);
        return out;
    }
}