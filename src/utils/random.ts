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
}