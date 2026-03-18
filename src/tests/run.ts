import { ITest, run_test } from "../utils/test";
import { NET_TEST } from "./net";

export const TESTS: ITest[] = [
    NET_TEST,
];

function evaluate() {
    let passed = 0;
    let errored = 0;
    for (let i = 0; i < TESTS.length; i++) {
        try {
            if (run_test(TESTS[i])) passed++;
        } catch (e) {
            console.log(e);
            errored++;
        }
    }

    if (passed === TESTS.length) {
        console.log(`Passed all ${passed} tests successfully`);
    } else {
        console.error(`${passed} / ${TESTS.length} passed. ${errored} threw an exception. ${TESTS.length - passed - errored} did not get expected result`);
    }
}

evaluate();