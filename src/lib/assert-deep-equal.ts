import { SubscriptionLog, TestMessages } from './types';
import './internal-matchers';

export type MessagesOrSubscriptions = TestMessages | SubscriptionLog[];

function expectedIsSubscriptionLogArray(actual: MessagesOrSubscriptions,
  expected: MessagesOrSubscriptions): expected is SubscriptionLog[] {
  return actual.length === 0 && expected.length === 0 ||
    expected.length !== 0 && (expected[0] as any).subscribedFrame !== undefined;
}

function actualIsSubscriptionsAndExpectedIsEmpty(actual: MessagesOrSubscriptions,
  expected: MessagesOrSubscriptions): actual is SubscriptionLog[] {
  return expected.length === 0 && actual.length !== 0 && (actual[0] as any).subscribedFrame !== undefined;
}

export function assertDeepEqual(actual: MessagesOrSubscriptions, expected: MessagesOrSubscriptions): void {
  if (!expected)
    return;

  if (actualIsSubscriptionsAndExpectedIsEmpty(actual, expected))
    expect(actual).toHaveEmptySubscriptions();
  else if (expectedIsSubscriptionLogArray(actual, expected))
    expect(actual).toBeSubscriptions(expected);
  else
    expect(actual).toBeNotifications(expected);
}
