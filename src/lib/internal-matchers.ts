import { SubscriptionLog, TestMessages } from './types';
import { ExpectationResult, MatchersObject } from '@vitest/expect';
import { marblize } from './marblizer';

interface InternalMatchers<R = unknown> {
    toBeNotifications: (messages: TestMessages) => R;

    toBeSubscriptions: (subscriptions: SubscriptionLog[]) => R;

    toHaveEmptySubscriptions: () => R;
}

export const internalMatchers: MatchersObject = {
    toBeNotifications(actual: TestMessages,
        expected: TestMessages): ExpectationResult {
        let message = '';

        const pass = this.equals(actual, expected);

        if (!pass) {
            const diff = this.utils.diff(expected, actual, { expand: true });

            message = this.utils.matcherHint('.toBeNotifications') +
                '\n\n' +
                `Expected notifications to be:\n` +
                `  ${this.utils.printExpected(expected)}\n` +
                `But got:\n` +
                `  ${this.utils.printReceived(actual)}` +
                `\n\nDifference:\n\n${diff}`;
        }

        return {
            pass,
            message: () => message
        };
    },
    toBeSubscriptions(actualSubs: SubscriptionLog[],
        expectedSubs: SubscriptionLog[]): ExpectationResult {
        const actual = marblize(actualSubs);
        const expected = marblize(expectedSubs);
        const pass = sameSubscriptions(actual, expected);
        let message = '';

        if (!pass) {
            const diff = this.utils.diff(expected, actual, { expand: true });

            message = this.utils.matcherHint('.toHaveSubscriptions') +
                '\n\n' +
                `Expected observable to have the following subscription points:\n` +
                `  ${this.utils.printExpected(expected)}\n` +
                `But got:\n` +
                `  ${this.utils.printReceived(actual)}` +
                `\n\nDifference:\n\n${diff}`;
        }

        return {
            pass,
            message: () => message
        };
    },
    toHaveEmptySubscriptions(actual: SubscriptionLog[]): ExpectationResult {
        const message = this.utils.matcherHint('.toHaveNoSubscriptions') +
            '\n\n' +
            `Expected observable to have no subscription points\n` +
            `But got:\n` +
            `  ${this.utils.printReceived(marblize(actual))}\n\n`;

        // this is a special case that always fails, see how it is used in
        // assertDeepEqual() function
        return {
            pass: false,
            message: () => message
        };
    }
}

expect.extend(internalMatchers);

declare module 'vitest' {
    interface Matchers<T = any> extends InternalMatchers<T> {
    }
}

function sameSubscriptions(actualMarbleArray: string[],
    expectedMarbleArray: string[]): boolean {
    if (actualMarbleArray.length !== expectedMarbleArray.length)
        return false;

    for (const actualMarble of actualMarbleArray)
        if (!expectedMarbleArray.includes(actualMarble))
            return false;

    return true;
}
