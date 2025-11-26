import { Marblizer } from '../marblizer';
import { customTestMatchers } from './custom-matchers';
import { MatcherState, SyncExpectationResult } from '@vitest/expect';

const marblizeSubscriptionsMock = vi.fn(), marblizeMock = vi.fn();

Marblizer.marblizeSubscriptions = marblizeSubscriptionsMock;
Marblizer.marblize = marblizeMock;

const matcherContextMock: MatcherState = {
  utils: {
    printRecieved: vi.fn(),
    printExpected: vi.fn(),
    matcherHint: vi.fn(),
    diff: vi.fn(),
  },
  equals: vi.fn((a, b) => a === b),
} as any;

const { toBeSubscriptions, toBeNotifications, toHaveEmptySubscriptions } = customTestMatchers;

describe('toBeSubscriptions test', () => {
  const actual = [
    { subscribedFrame: 30, unsubscribedFrame: 60 },
    { subscribedFrame: 10, unsubscribedFrame: 50 },
  ];
  const expected = [
    { subscribedFrame: 30, unsubscribedFrame: 60 }
  ];

  beforeEach(() => marblizeSubscriptionsMock.mockClear());

  it('Should call marblizeSubscriptions for both expected and actual subscriptions', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    // @ts-ignore
    toBeSubscriptions.call(matcherContextMock, actual, expected);

    expect(marblizeSubscriptionsMock).toHaveBeenCalledTimes(2);
    expect(marblizeSubscriptionsMock).toHaveBeenCalledWith(actual);
    expect(marblizeSubscriptionsMock).toHaveBeenCalledWith(expected);
  });

  it('Should fail if the array of expected subscriptions has different length than the array of actual subscriptions', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce(['--^--!']).mockReturnValueOnce(['--^--!', '--^--!']);

    // @ts-ignore
    const { pass } = toBeSubscriptions.call(matcherContextMock, actual, expected) as SyncExpectationResult;

    expect(pass).toBeFalsy();
  });

  it('Should pass if the expected subscriptions is the same set as the actual subscriptions', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce(['--^--!', '^--!']).mockReturnValueOnce(['^--!', '--^--!']);

    // @ts-ignore
    const { pass } = toBeSubscriptions.call(matcherContextMock, actual, expected) as SyncExpectationResult;

    expect(pass).toBeTruthy();
  });

  it('Should fail if the expected subscriptions do not equal to the actual subscriptions', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce(['--^--!', '--^---!']).mockReturnValueOnce(['--^--!', '--^--!']);

    // @ts-ignore
    const { pass } = toBeSubscriptions.call(matcherContextMock, actual, expected) as SyncExpectationResult;

    expect(pass).toBeFalsy();
  });
});

describe('toBeNotifications test', () => {
  const actual = [
    { frame: 30, notification: { kind: 'N', value: 'b' } as const },
    { frame: 110, notification: { kind: 'N', value: 'e' } as const },
  ];
  const expected = [
    { frame: 30, notification: { kind: 'N', value: 'b' } as const }
  ];

  beforeEach(() => {
    marblizeMock.mockClear();
  });

  it('Should call marblize for both expected and actual subscriptions', () => {
    marblizeMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    // @ts-ignore
    toBeNotifications.call(matcherContextMock, actual, expected);

    expect(marblizeMock).toHaveBeenCalledTimes(2);
    expect(marblizeMock).toHaveBeenCalledWith(actual);
    expect(marblizeMock).toHaveBeenCalledWith(expected);
  });

  it('Should pass if the expected notifications equal to the actual notifications', () => {
    marblizeMock.mockReturnValueOnce('---a---b|').mockReturnValueOnce('---a---b|');

    // @ts-ignore
    const { pass } = toBeNotifications.call(matcherContextMock, actual, expected) as SyncExpectationResult;

    expect(pass).toBeTruthy();
  });

  it('Should fail if the expected notifications do not equal to the actual notifications', () => {
    marblizeMock.mockReturnValueOnce('---a---b|').mockReturnValueOnce('---a----b|');

    // @ts-ignore
    const { pass } = toBeNotifications.call(matcherContextMock, actual, expected) as SyncExpectationResult;

    expect(pass).toBeFalsy();
  });

  it('Should call marblizer when all the values are characters and there is a completion notification', () => {
    marblizeMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    // @ts-ignore
    toBeNotifications.call(matcherContextMock, actual, [...expected, { frame: 40, notification: { kind: 'C' } }]);

    expect(marblizeMock).toHaveBeenCalled();
  });

  it('Should call marblizer when all the values are characters and there is a default error notification', () => {
    marblizeMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    // @ts-ignore
    toBeNotifications.call(matcherContextMock, actual, [
      ...expected,
      { frame: 40, notification: { kind: 'E', error: 'error' } },
    ]);

    expect(marblizeMock).toHaveBeenCalled();
  });

  it('Should not call marblizer when all the values are characters and there is a non-default error notification', () => {
    marblizeMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    // @ts-ignore
    toBeNotifications.call(matcherContextMock, actual, [
      ...expected,
      { frame: 40, notification: { kind: 'E', error: 'A' } },
    ]);

    expect(marblizeMock).not.toHaveBeenCalled();
  });

  it('Should call marblizer when values are serialiable to a single character', () => {
    marblizeMock.mockReturnValueOnce([]).mockReturnValueOnce([]);
    // @ts-ignore
    toBeNotifications.call(matcherContextMock, actual, [
      ...expected,
      { frame: 40, notification: { kind: 'N', value: 0 } },
    ]);

    expect(marblizeMock).toHaveBeenCalled();
  });
});

describe('toHaveEmptySubscriptions test', () => {
  const actual = [
    { subscribedFrame: 30, unsubscribedFrame: 60 }
  ];

  beforeEach(() => {
    marblizeSubscriptionsMock.mockClear();
  });

  it('Should call marblizeSubscriptions if fails', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce([]);
    // @ts-ignore
    toHaveEmptySubscriptions.call(matcherContextMock, actual);

    expect(marblizeSubscriptionsMock).toHaveBeenCalledTimes(1);
    expect(marblizeSubscriptionsMock).toHaveBeenCalledWith(actual);
  });

  it('Should fail if the actual subscriptions array is not empty', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce(['--^--!']);

    // @ts-ignore
    const { pass } = toHaveEmptySubscriptions.call(matcherContextMock, actual) as SyncExpectationResult;

    expect(pass).toBeFalsy();
  });

  it('Should pass if the actual subscriptions array is undefined', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce(['--^--!', '^--!']);

    // @ts-ignore
    const { pass } = toHaveEmptySubscriptions.call(matcherContextMock, undefined) as SyncExpectationResult;

    expect(pass).toBeTruthy();
  });

  it('Should pass if the actual subscriptions array is empty', () => {
    marblizeSubscriptionsMock.mockReturnValueOnce(['--^--!', '--^---!']);

    // @ts-ignore
    const { pass } = toHaveEmptySubscriptions.call(matcherContextMock, []) as SyncExpectationResult;

    expect(pass).toBeTruthy();
  });
});
