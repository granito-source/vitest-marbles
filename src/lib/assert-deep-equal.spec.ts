import { assertDeepEqual } from './assert-deep-equal';

const vitestExpect = expect;

const matchersMock = {
  toBeSubscriptions: vi.fn(),
  toBeNotifications: vi.fn(),
  toHaveEmptySubscriptions: vi.fn(),
};

const expectMock = vi.fn(() => matchersMock);

expect = expectMock as any;

describe('assertDeepEqual()', () => {
  beforeEach(() => {
    matchersMock.toBeNotifications.mockClear();
    matchersMock.toBeSubscriptions.mockClear();
    matchersMock.toHaveEmptySubscriptions.mockClear();
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

    vitestExpect(matchersMock.toBeSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('calls subscriptions matcher if actual is empty array and expected is array of subscriptions', () => {
    assertDeepEqual(
      [],
      [
        { subscribedFrame: 30, unsubscribedFrame: 60 },
        { subscribedFrame: 10, unsubscribedFrame: 50 },
      ]
    );

    vitestExpect(matchersMock.toBeSubscriptions).toHaveBeenCalledTimes(1);
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

    vitestExpect(matchersMock.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('calls notifications matcher when the actual is empty array and expected is array of notifications', () => {
    assertDeepEqual(
      [],
      [
        { frame: 30, notification: { kind: 'N', value: 'b' } },
        { frame: 110, notification: { kind: 'N', value: 'e' } },
      ]
    );

    vitestExpect(matchersMock.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('calls notifications matcher when expected is empty array and actual is array of notifications', () => {
    assertDeepEqual(
      [
        { frame: 30, notification: { kind: 'N', value: 'b' } },
        { frame: 110, notification: { kind: 'N', value: 'e' } },
      ],
      []
    );

    vitestExpect(matchersMock.toBeNotifications).toHaveBeenCalledTimes(1);
  });

  it('calls empty subscriptions matcher if expected array is empty and actual array is array of subscriptions', () => {
    assertDeepEqual(
      [
        { subscribedFrame: 30, unsubscribedFrame: 60 }
      ],
      []
    );

    vitestExpect(matchersMock.toHaveEmptySubscriptions).toHaveBeenCalledTimes(1);
  });
});
