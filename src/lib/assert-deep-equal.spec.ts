import { assertDeepEqual } from './assert-deep-equal';
import { SubscriptionLog, TestMessages } from './types';

describe('assertDeepEqual()', () => {
  const subscriptions: SubscriptionLog[] = [
    { subscribedFrame: 10, unsubscribedFrame: 30 },
    { subscribedFrame: 50, unsubscribedFrame: Infinity }
  ];

  const messages: TestMessages = [
    { frame: 20, notification: { kind: 'N', value: 'b' } },
    { frame: 50, notification: { kind: 'N', value: 'e' } }
  ];

  it('returns normally when expected is undefined', () => {
    expect(() => assertDeepEqual([], undefined)).not.toThrowError();
    expect(() => assertDeepEqual(messages, undefined)).not.toThrowError();
    expect(() => assertDeepEqual(subscriptions, undefined)).not.toThrowError();
  });

  it('returns normally when expected and actual are empty', () => {
    expect(() => assertDeepEqual([], [])).not.toThrowError();
  });

  it('returns normally when the same subscriptions', () => {
    expect(() => assertDeepEqual(subscriptions, subscriptions)).not.toThrowError();
  });

  it('throws error when actual subscriptions but expected is empty', () => {
    expect(() => assertDeepEqual(subscriptions, [])).toThrowError(expect.toSatisfy(e =>
      /Expected observable to have no subscription points.*But got:.*"-\^-!".*"-----\^"/s.test(e.message)));
  });

  it('throws error when actual is empty but expected subscriptions', () => {
    expect(() => assertDeepEqual([], subscriptions)).toThrowError(expect.toSatisfy(e =>
      /Expected observable to have the following subscription points:.*"-\^-!".*"-----\^".*But got:.*\[]/s.test(e.message)));
  });

  it('throws error when actual and expected subscriptions have different length', () => {
    const actual = [
      { subscribedFrame: 0, unsubscribedFrame: 20 },
      ...subscriptions
    ];

    expect(() => assertDeepEqual(actual, subscriptions)).toThrowError(expect.toSatisfy(e =>
      /Expected observable to have the following subscription points:.*"-\^-!".*"-----\^".*But got:.*"\^-!".*"-\^-!".*"-----\^".*Difference:/s.test(e.message)));
  });

  it('throws error when actual and expected subscriptions do not match', () => {
    const actual = [
      { subscribedFrame: 0, unsubscribedFrame: 20 },
      { subscribedFrame: 50, unsubscribedFrame: Infinity }
    ];

    expect(() => assertDeepEqual(actual, subscriptions)).toThrowError(expect.toSatisfy(e =>
      /Expected observable to have the following subscription points:.*"-\^-!".*"-----\^".*But got:.*"\^-!".*"-----\^".*Difference:/s.test(e.message)));
  });

  it('returns normally when the same messages', () => {
    expect(() => assertDeepEqual(messages, messages)).not.toThrowError();
  });

  it('throws error when actual messages but expected is empty', () => {
    expect(() => assertDeepEqual(messages, [])).toThrowError(expect.toSatisfy(e =>
      /Expected notifications to be:.*"".*But got:.*"--b--e".*Difference:/s.test(e.message)));
  });

  it('throws error when actual empty but expected messages', () => {
    expect(() => assertDeepEqual([], messages)).toThrowError(expect.toSatisfy(e =>
      /Expected notifications to be:.*"--b--e".*But got:.*"".*Difference:/s.test(e.message)));
  });

  it('throws error when actual and expected messages are different', () => {
    const actual: TestMessages = [
      ...messages,
      { frame: 60, notification: { kind: 'C' }}
    ];

    expect(() => assertDeepEqual(actual, messages)).toThrowError(expect.toSatisfy(e =>
      /Expected notifications to be:.*"--b--e".*But got:.*"--b--e\|".*Difference:/s.test(e.message)));
  });

  it('throws error when actual and expected messages have different values', () => {
    const actual: TestMessages = [
      { frame: 20, notification: { kind: 'N', value: 43 } }
    ];
    const expected: TestMessages = [
      { frame: 20, notification: { kind: 'N', value: 42 } }
    ];

    expect(() => assertDeepEqual(actual, expected)).toThrowError(expect.toSatisfy(e =>
      /Expected notifications to be:.*Array \[.*"value": 42.*But got:.*Array \[.*"value": 43.*Difference/s.test(e.message)));
  });
});
