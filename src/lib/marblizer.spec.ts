import { SubscriptionLog, TestMessages } from './types';
import { Marblizer } from './marblizer';

describe('Marblizer', () => {
  describe('marblize()', () => {
    it('converts TestMessages to marbles', () => {
      const sample: TestMessages = [
        { frame: 30, notification: { kind: 'N', value: 'b' } },
        { frame: 30, notification: { kind: 'N', value: 'e' } },
        { frame: 110, notification: { kind: 'N', value: 'c' } },
        { frame: 130, notification: { kind: 'N', value: 'f' } }
      ];

      expect(Marblizer.marblize(sample)).toBe('---(be)----c-f');
    });

    it('recognizes completion frame', () => {
      const sample: TestMessages = [
        { frame: 30, notification: { kind: 'N', value: 'b' } },
        { frame: 110, notification: { kind: 'N', value: 'e' } },
        { frame: 140, notification: { kind: 'C' } }
      ];

      expect(Marblizer.marblize(sample)).toBe('---b-------e--|');
    });

    it('recognizes error frame', () => {
      const sample: TestMessages = [
        { frame: 30, notification: { kind: 'N', value: 'b' } },
        { frame: 30, notification: { kind: 'N', value: 'e' } },
        { frame: 110, notification: { kind: 'E', error: null } }
      ];

      expect(Marblizer.marblize(sample)).toBe('---(be)----#');
    });

    it('handles no emissions without completion', () => {
      const sample: TestMessages = [];

      expect(Marblizer.marblize(sample)).toBe('');
    });

    it('handles no emissions with completion', () => {
      const sample: TestMessages = [{ frame: 110, notification: { kind: 'C' } }];

      expect(Marblizer.marblize(sample)).toBe('-----------|');
    });
  });

  describe('marblizeSubscriptions()', () => {
    it('converts SubscriptionLog without completion to marbles', () => {
      const logs: SubscriptionLog[] = [{ subscribedFrame: 20, unsubscribedFrame: Infinity }];

      expect(Marblizer.marblizeSubscriptions(logs)).toEqual(['--^']);
    });

    it('converts SubscriptionLog with completion to marbles', () => {
      const logs: SubscriptionLog[] = [{ subscribedFrame: 20, unsubscribedFrame: 80 }];

      expect(Marblizer.marblizeSubscriptions(logs)).toEqual(['--^-----!']);
    });

    it('handles multiple subscription events', () => {
      const logs: SubscriptionLog[] = [
        { subscribedFrame: 30, unsubscribedFrame: 60 },
        { subscribedFrame: 10, unsubscribedFrame: 50 },
      ];

      expect(Marblizer.marblizeSubscriptions(logs)).toEqual(['---^--!', '-^---!']);
    });
  });
});
