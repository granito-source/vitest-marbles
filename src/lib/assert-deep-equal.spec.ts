import { assertDeepEqual } from './assert-deep-equal';

const realExpect = expect;

const matchers = {
  toBeSubscriptions: vi.fn(),
  toBeNotifications: vi.fn(),
  toHaveEmptySubscriptions: vi.fn(),
};

const expectMock = vi.fn(() => matchers);

expect = expectMock as any;

describe('assertDeepEqual()', () => {
  beforeEach(() => {
    matchers.toBeNotifications.mockClear();
    matchers.toBeSubscriptions.mockClear();
    matchers.toHaveEmptySubscriptions.mockClear();
  });

  it('calls subscriptions matcher if received arrays of subscriptions', () => {
    assertDeepEqual(
      [
        { subscribedFrame: 30, unsubscribedFrame: 60 },
        { subscribedFrame: 10, unsubscribedFrame: 50 },
      ],
      [
        { subscribedFrame: 30, unsubscribedFrame: 60 },
        { subscribedFrame: 10, unsubscribedFrame: 50 },
      ]
    );

    realExpect(matchers.toBeSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('calls subscriptions matcher if actual is empty array and expected is array of subscriptions', () => {
    assertDeepEqual(
      [],
      [
        { subscribedFrame: 30, unsubscribedFrame: 60 },
        { subscribedFrame: 10, unsubscribedFrame: 50 },
      ]
    );

    realExpect(matchers.toBeSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('calls notifications matcher if received arrays of notifications', () => {
    assertDeepEqual(
      [
        { frame: 30, notification: { kind: 'N', value: 'b' } },
        { frame: 110, notification: { kind: 'N', value: 'e' } },
      ],
      [
        { frame: 30, notification: { kind: 'N', value: 'b' } },
        { frame: 110, notification: { kind: 'N', value: 'e' } },
      ]
    );

    realExpect(matchers.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('calls notifications matcher when the actual is empty array and expected is array of notifications', () => {
    assertDeepEqual(
      [],
      [
        { frame: 30, notification: { kind: 'N', value: 'b' } },
        { frame: 110, notification: { kind: 'N', value: 'e' } },
      ]
    );

    realExpect(matchers.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('calls notifications matcher when expected is empty array and actual is array of notifications', () => {
    assertDeepEqual(
      [
        { frame: 30, notification: { kind: 'N', value: 'b' } },
        { frame: 110, notification: { kind: 'N', value: 'e' } },
      ],
      []
    );

    realExpect(matchers.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('calls empty subscriptions matcher if expected array is empty and actual array is array of subscriptions', () => {
    assertDeepEqual(
      [
        { subscribedFrame: 30, unsubscribedFrame: 60 }
      ],
      []
    );

    realExpect(matchers.toHaveEmptySubscriptions).toHaveBeenCalledTimes(1);
  });
});
