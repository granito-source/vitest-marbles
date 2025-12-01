import { SubscriptionLog, TestMessages } from './types';
import { Marblizer } from './marblizer';

describe('Marblizer', () => {
  it('converts to marbles TestMessages', () => {
    // First dash is frame 0
    // ---(be)----c-f-----|
    const sample: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 30, notification: { kind: 'N', value: 'e' } },
      { frame: 110, notification: { kind: 'N', value: 'c' } },
      { frame: 130, notification: { kind: 'N', value: 'f' } },
      { frame: 190, notification: { kind: 'C' } },
    ];
    const marble = Marblizer.marblize(sample);

    expect(marble).toEqual('---(be)----c-f-----|');
  });

  it('converts to marbles TestMessages with error', () => {
    const sample: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 30, notification: { kind: 'N', value: 'e' } },
      { frame: 110, notification: { kind: 'E', error: null } },
    ];
    const marble = Marblizer.marblize(sample);

    expect(marble).toEqual('---(be)----#');
  });

  it('converts to marbles TestMessages without completion', () => {
    const sample: TestMessages = [
      { frame: 30, notification: { kind: 'N', value: 'b' } },
      { frame: 110, notification: { kind: 'N', value: 'e' } },
    ];
    const marble = Marblizer.marblize(sample);

    expect(marble).toEqual('---b-------e');
  });

  it('converts to marbles Subscriptions without completion', () => {
    const sample: SubscriptionLog[] = [{ subscribedFrame: 20, unsubscribedFrame: Infinity }];
    const marble = Marblizer.marblizeSubscriptions(sample);

    expect(marble).toEqual(['--^']);
  });

  it('converts to marbles TestMessages without emission (but with completion)', () => {
    const sample: TestMessages = [{ frame: 110, notification: { kind: 'C' } }];
    const marble = Marblizer.marblize(sample);

    expect(marble).toEqual('-----------|');
  });

  it('converts to marbles SubscriptionLogs', () => {
    const marble = Marblizer.marblizeSubscriptions([
      { subscribedFrame: 30, unsubscribedFrame: 60 },
      { subscribedFrame: 10, unsubscribedFrame: 50 },
    ]);

    expect(marble).toEqual(['---^--!', '-^---!']);
  });
});
