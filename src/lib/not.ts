import { Scheduler } from "./scheduler";
import { ExpectationResult } from "@vitest/expect";

const not = Symbol('vitest-marbles-not');

export function negateLast(): ExpectationResult {
    const flushTests: FlushableTest[] = Scheduler.get()['flushTests'];
    const expected = flushTests[flushTests.length - 1].expected;

    flushTests[flushTests.length - 1].expected = negate(expected);

    return {
        pass: false,
        message: () => ''
    };
}

export function negate(expected?: any[]): any[] | undefined {
    if (!expected)
        return undefined;

    return [not, ...expected];
}

export function negated(expected: any[]): boolean {
    return expected.length > 0 && expected[0] === not;
}

export function affirm(negated: any[]): any[] {
    return negated.slice(1);
}

interface FlushableTest {
    ready: boolean;
    actual?: any[];
    expected?: any[];
}
