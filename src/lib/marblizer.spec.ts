import { SubscriptionLog, TestMessages } from './types';
import { marblize, marblizeSubscriptions } from './marblizer';

describe('marblize()', () => {
  it('converts TestMessages to marbles', () => {
    const sample: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 30, notification: { kind: 'N', value: 'e' } },
      { frame: 110, notification: { kind: 'N', value: 'c' } },
      { frame: 130, notification: { kind: 'N', value: 'f' } }
    ];

    expect(marblize(sample)).toBe('---(be)----c-f');
  });

  it('recognizes completion frame', () => {
    const sample: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 110, notification: { kind: 'N', value: 'e' } },
      { frame: 140, notification: { kind: 'C' } }
    ];

    expect(marblize(sample)).toBe('---b-------e--|');
  });

  it('recognizes error frame', () => {
    const sample: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 30, notification: { kind: 'N', value: 'e' } },
      { frame: 110, notification: { kind: 'E', error: null } }
    ];

    expect(marblize(sample)).toBe('---(be)----#');
  });

  it('handles no emissions without completion', () => {
    const sample: TestMessages = [];

    expect(marblize(sample)).toBe('');
  });

  it('handles no emissions with completion', () => {
    const sample: TestMessages = [{ frame: 110, notification: { kind: 'C' } }];

    expect(marblize(sample)).toBe('-----------|');
  });
});

describe('marblizeSubscriptions()', () => {
  it('converts SubscriptionLog without completion to marbles', () => {
    const logs: SubscriptionLog[] = [{ subscribedFrame: 20, unsubscribedFrame: Infinity }];

    expect(marblizeSubscriptions(logs)).toEqual(['--^']);
  });

  it('converts SubscriptionLog with completion to marbles', () => {
    const logs: SubscriptionLog[] = [{ subscribedFrame: 20, unsubscribedFrame: 80 }];

    expect(marblizeSubscriptions(logs)).toEqual(['--^-----!']);
  });

  it('handles multiple subscription events', () => {
    const logs: SubscriptionLog[] = [
      { subscribedFrame: 30, unsubscribedFrame: 60 },
      { subscribedFrame: 10, unsubscribedFrame: 50 },
    ];

    expect(marblizeSubscriptions(logs)).toEqual(['---^--!', '-^---!']);
  });
});
