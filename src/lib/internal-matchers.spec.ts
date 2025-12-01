import { Marblizer } from './marblizer';
import { internalMatchers } from './internal-matchers';
import { MatcherState } from '@vitest/expect';

const marblizeSubscriptions = vi.fn();

const marblize = vi.fn();

Marblizer.marblizeSubscriptions = marblizeSubscriptions;
Marblizer.marblize = marblize;

const matcherState: MatcherState = {
  utils: {
    printReceived: vi.fn(),
    printExpected: vi.fn(),
    matcherHint: vi.fn(),
    diff: vi.fn(),
  },
  equals: vi.fn((a, b) => a === b),
} as any;

const { toBeSubscriptions, toBeNotifications, toHaveEmptySubscriptions } = internalMatchers;

describe('toBeSubscriptions()', () => {
  const actual = [
    { subscribedFrame: 30, unsubscribedFrame: 60 },
    { subscribedFrame: 10, unsubscribedFrame: 50 },
  ];
  const expected = [
    { subscribedFrame: 30, unsubscribedFrame: 60 }
  ];

  beforeEach(() => marblizeSubscriptions.mockClear());

  it('calls marblizeSubscriptions for both expected and actual subscriptions', () => {
    marblizeSubscriptions.mockReturnValueOnce([]).mockReturnValueOnce([]);

    // @ts-ignore
    toBeSubscriptions.call(matcherState, actual, expected);

    expect(marblizeSubscriptions).toHaveBeenCalledTimes(2);
    expect(marblizeSubscriptions).toHaveBeenCalledWith(actual);
    expect(marblizeSubscriptions).toHaveBeenCalledWith(expected);
  });

  it('fails if the array of expected subscriptions has different length than the array of actual subscriptions', () => {
    marblizeSubscriptions.mockReturnValueOnce(['--^--!']).mockReturnValueOnce(['--^--!', '--^--!']);

    // @ts-ignore
    const { pass } = toBeSubscriptions.call(matcherState, actual, expected);

    expect(pass).toBe(false);
  });

  it('passes if the expected subscriptions is the same set as the actual subscriptions', () => {
    marblizeSubscriptions.mockReturnValueOnce(['--^--!', '^--!']).mockReturnValueOnce(['^--!', '--^--!']);

    // @ts-ignore
    const { pass } = toBeSubscriptions.call(matcherState, actual, expected);

    expect(pass).toBe(true);
  });

  it('fails if the expected subscriptions do not equal to the actual subscriptions', () => {
    marblizeSubscriptions.mockReturnValueOnce(['--^--!', '--^---!']).mockReturnValueOnce(['--^--!', '--^--!']);

    // @ts-ignore
    const { pass } = toBeSubscriptions.call(matcherState, actual, expected);

    expect(pass).toBe(false);
  });
});

describe('toBeNotifications()', () => {
  const actual = [
    { frame: 30, notification: { kind: 'N', value: 'b' } as const },
    { frame: 110, notification: { kind: 'N', value: 'e' } as const },
  ];
  const expected = [
    { frame: 30, notification: { kind: 'N', value: 'b' } as const }
  ];

  beforeEach(() => marblize.mockClear());

  it('calls marblize for both expected and actual subscriptions', () => {
    marblize.mockReturnValueOnce([]).mockReturnValueOnce([]);

    // @ts-ignore
    toBeNotifications.call(matcherState, actual, expected);

    expect(marblize).toHaveBeenCalledTimes(2);
    expect(marblize).toHaveBeenCalledWith(actual);
    expect(marblize).toHaveBeenCalledWith(expected);
  });

  it('passes if the expected notifications equal to the actual notifications', () => {
    marblize.mockReturnValueOnce('---a---b|').mockReturnValueOnce('---a---b|');

    // @ts-ignore
    const { pass } = toBeNotifications.call(matcherState, actual, expected);

    expect(pass).toBe(true);
  });

  it('fails if the expected notifications do not equal to the actual notifications', () => {
    marblize.mockReturnValueOnce('---a---b|').mockReturnValueOnce('---a----b|');

    // @ts-ignore
    const { pass } = toBeNotifications.call(matcherState, actual, expected);

    expect(pass).toBe(false);
  });

  it('calls marblizer when all the values are characters and there is a completion notification', () => {
    marblize.mockReturnValueOnce([]).mockReturnValueOnce([]);
    // @ts-ignore
    toBeNotifications.call(matcherState, actual, [...expected, { frame: 40, notification: { kind: 'C' } }]);

    expect(marblize).toHaveBeenCalled();
  });

  it('calls marblizer when all the values are characters and there is a default error notification', () => {
    marblize.mockReturnValueOnce([]).mockReturnValueOnce([]);

    // @ts-ignore
    toBeNotifications.call(matcherState, actual, [
      ...expected,
      { frame: 40, notification: { kind: 'E', error: 'error' } },
    ]);

    expect(marblize).toHaveBeenCalled();
  });

  it('does not call marblizer when all the values are characters and there is a non-default error notification', () => {
    marblize.mockReturnValueOnce([]).mockReturnValueOnce([]);

    // @ts-ignore
    toBeNotifications.call(matcherState, actual, [
      ...expected,
      { frame: 40, notification: { kind: 'E', error: 'A' } },
    ]);

    expect(marblize).not.toHaveBeenCalled();
  });

  it('calls marblizer when values are serialiable to a single character', () => {
    marblize.mockReturnValueOnce([]).mockReturnValueOnce([]);

    // @ts-ignore
    toBeNotifications.call(matcherState, actual, [
      ...expected,
      { frame: 40, notification: { kind: 'N', value: 0 } },
    ]);

    expect(marblize).toHaveBeenCalled();
  });
});

describe('toHaveEmptySubscriptions()', () => {
  const actual = [
    { subscribedFrame: 30, unsubscribedFrame: 60 }
  ];

  beforeEach(() => marblizeSubscriptions.mockClear());

  it('Should call marblizeSubscriptions if fails', () => {
    marblizeSubscriptions.mockReturnValueOnce([]);

    // @ts-ignore
    toHaveEmptySubscriptions.call(matcherState, actual);

    expect(marblizeSubscriptions).toHaveBeenCalledTimes(1);
    expect(marblizeSubscriptions).toHaveBeenCalledWith(actual);
  });

  it('Should fail if the actual subscriptions array is not empty', () => {
    marblizeSubscriptions.mockReturnValueOnce(['--^--!']);

    // @ts-ignore
    const { pass } = toHaveEmptySubscriptions.call(matcherState, actual);

    expect(pass).toBeFalsy();
  });

  it('Should pass if the actual subscriptions array is undefined', () => {
    marblizeSubscriptions.mockReturnValueOnce(['--^--!', '^--!']);

    // @ts-ignore
    const { pass } = toHaveEmptySubscriptions.call(matcherState, undefined);

    expect(pass).toBeTruthy();
  });

  it('Should pass if the actual subscriptions array is empty', () => {
    marblizeSubscriptions.mockReturnValueOnce(['--^--!', '--^---!']);

    // @ts-ignore
    const { pass } = toHaveEmptySubscriptions.call(matcherState, []);

    expect(pass).toBeTruthy();
  });
});
