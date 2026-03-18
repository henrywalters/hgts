export interface ITest {
    expected: any;
    run: () => any;
}

export function run_test(test: ITest) {
    const actual = test.run();
    if (actual === test.expected) {
        return true;
    }
    console.warn(`Expected: `, test.expected, 'Got: ', actual);
    return false;
}