import { NetMessage, NetMessages } from "../net/messages";
import { ITest } from "../utils/test";
import { Array, String, Types } from "../core/reflection";

enum Messages {
    Foo,
    Bar,
}

export class Bar {
    @String()
    bar = "Hello World";
}

export class Foo extends NetMessage {
    type = Messages.Foo;

    @String()
    test = "Testing";

    @Array(Types.Float)
    numbers: number[] = [1, 2, 3, 4, 5]

    @Array(Types.Class, Bar)
    bars: Bar[] = [new Bar(), new Bar()];
}

const expected = new Foo();

export const NET_TEST: ITest = {
    expected,
    run: () => {
        const messages = new NetMessages([
            Foo,
        ]);
        console.log(expected);
        const serialized = messages.write(expected);
        console.log(serialized);
        const deserialized = messages.read(serialized);
        console.log(deserialized);
        return deserialized;
    }
}