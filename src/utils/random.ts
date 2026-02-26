import { Vector2, Vector3 } from "three";

export class Random {
    public static Float(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public static Int(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static Dice(size: number) {
        return Random.Int(1, size + 1);
    }

    public static D6() {
        return Random.Dice(6);
    }

    public static D20() {
        return Random.Dice(20);
    }

    public static Vector2(min: number, max: number): Vector2 {
        return new Vector2(Random.Float(min, max), Random.Float(min, max));
    }

    public static Vector3(min: number, max: number): Vector3 {
        return new Vector3(Random.Float(min, max), Random.Float(min, max));
    }

    public static UnitVector2(radius: number): Vector2 {
        const vector = new Vector2(Random.Float(0, radius), Random.Float(0, radius));
        vector.normalize();
        return vector;
    }

    public static UnitVector3(radius: number): Vector3 {
        const vector = new Vector3(Random.Float(0, radius), Random.Float(0, radius), Random.Float(0, radius));
        vector.normalize();
        return vector;
    }
}