import { SubscriptionLog, TestMessages } from './types';
import { tryMarblizing, marblize } from './marblizer';

describe('tryMarblizing()', () => {
  it('does nothing when TestMessages have non-character values', () => {
    const messages: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 130, notification: { kind: 'N', value: 42 } }
    ];

    expect(tryMarblizing(messages)).toEqual(messages);
  });

  it('converts TestMessages to marbles when all are characters', () => {
    const messages: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 30, notification: { kind: 'N', value: 'e' } },
      { frame: 110, notification: { kind: 'N', value: 'c' } },
      { frame: 130, notification: { kind: 'N', value: 'f' } }
    ];

    expect(tryMarblizing(messages)).toBe('---(be)----c-f');
  });

  it('recognizes completion frame', () => {
    const messages: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 110, notification: { kind: 'N', value: 'e' } },
      { frame: 140, notification: { kind: 'C' } }
    ];

    expect(tryMarblizing(messages)).toBe('---b-------e--|');
  });

  it('recognizes default error frame', () => {
    const messages: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 30, notification: { kind: 'N', value: 'e' } },
      { frame: 110, notification: { kind: 'E', error: 'error' } }
    ];

    expect(tryMarblizing(messages)).toBe('---(be)----#');
  });

  it('does nothing when error value is provided', () => {
    const sample: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 30, notification: { kind: 'N', value: 'e' } },
      { frame: 110, notification: { kind: 'E', error: new Error('error') } }
    ];

    expect(tryMarblizing(sample)).toEqual(sample);
  });

  it('handles no emissions without completion', () => {
    const messages: TestMessages = [];

    expect(tryMarblizing(messages)).toBe('');
  });

  it('handles no emissions with completion', () => {
    const messages: TestMessages = [{ frame: 110, notification: { kind: 'C' } }];

    expect(tryMarblizing(messages)).toBe('-----------|');
  });
});

describe('marblize()', () => {
  it('converts SubscriptionLog without completion to marbles', () => {
    const subscriptions: SubscriptionLog[] = [{ subscribedFrame: 20, unsubscribedFrame: Infinity }];

    expect(marblize(subscriptions)).toEqual(['--^']);
  });

  it('converts SubscriptionLog with completion to marbles', () => {
    const subscriptions: SubscriptionLog[] = [{ subscribedFrame: 20, unsubscribedFrame: 80 }];

    expect(marblize(subscriptions)).toEqual(['--^-----!']);
  });

  it('handles multiple subscription events', () => {
    const subscriptions: SubscriptionLog[] = [
      { subscribedFrame: 30, unsubscribedFrame: 60 },
      { subscribedFrame: 10, unsubscribedFrame: 50 },
    ];

    expect(marblize(subscriptions)).toEqual(['---^--!', '-^---!']);
  });
});
