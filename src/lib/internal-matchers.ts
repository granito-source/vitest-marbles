import { SubscriptionLog, TestMessages } from './types';
import { ExpectationResult, MatchersObject } from '@vitest/expect';
import { canMarblize, marblize, marblizeSubscriptions } from './marblizer';

interface InternalMatchers<R = unknown> {
  toBeNotifications: (messages: TestMessages) => R;

  toBeSubscriptions: (subscriptions: SubscriptionLog[]) => R;

  toHaveEmptySubscriptions: () => R;
}

export const internalMatchers: MatchersObject = {
  toBeNotifications(actual: TestMessages, expected: TestMessages): ExpectationResult {
    let actualMarble: string | TestMessages = actual;
    let expectedMarble: string | TestMessages = expected;
    let message = '';

    if (canMarblize(actual, expected)) {
      actualMarble = marblize(actual);
      expectedMarble = marblize(expected);
    }

    const pass = this.equals(actualMarble, expectedMarble);

    if (!pass) {
        const difference = this.utils.diff(expectedMarble, actualMarble, {
          expand: true,
        });

        message = this.utils.matcherHint('.toBeNotifications') +
          '\n\n' +
          `Expected notifications to be:\n` +
          `  ${this.utils.printExpected(expectedMarble)}\n` +
          `But got:\n` +
          `  ${this.utils.printReceived(actualMarble)}` +
          `\n\nDifference:\n\n${difference}`;
    }

    return {
      pass,
      message: () => message
    };
  },
  toBeSubscriptions(actual: SubscriptionLog[], expected: SubscriptionLog[]): ExpectationResult {
    const actualMarbleArray = marblizeSubscriptions(actual);
    const expectedMarbleArray = marblizeSubscriptions(expected);
    const pass = subscriptionsPass(actualMarbleArray, expectedMarbleArray);
    let message = '';

    if (!pass) {
      const difference = this.utils.diff(expectedMarbleArray, actualMarbleArray, {
        expand: true
      });

      message = this.utils.matcherHint('.toHaveSubscriptions') +
        '\n\n' +
        `Expected observable to have the following subscription points:\n` +
        `  ${this.utils.printExpected(expectedMarbleArray)}\n` +
        `But got:\n` +
        `  ${this.utils.printReceived(actualMarbleArray)}` +
        `\n\nDifference:\n\n${difference}`;
    }

    return {
      pass,
      message: () => message
    };
  },
  toHaveEmptySubscriptions(actual: SubscriptionLog[] | undefined): ExpectationResult {
    const pass = !(actual && actual.length > 0);
    let message = '';

    if (!pass)
      message = this.utils.matcherHint('.toHaveNoSubscriptions') +
      '\n\n' +
      `Expected observable to have no subscription points\n` +
      `But got:\n` +
      `  ${this.utils.printReceived(marblizeSubscriptions(actual))}\n\n`;

    return {
      pass,
      message: () => message
    };
  }
}

expect.extend(internalMatchers);

declare module 'vitest' {
  interface Matchers<T = any> extends InternalMatchers<T> {
  }
}

function subscriptionsPass(actualMarbleArray: string[], expectedMarbleArray: string[]): boolean {
  if (actualMarbleArray.length !== expectedMarbleArray.length)
    return false;

  for (const actualMarble of actualMarbleArray)
    if (!expectedMarbleArray.includes(actualMarble))
      return false;

  return true;
}
