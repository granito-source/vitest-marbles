import { SubscriptionLog } from './types';
import { marblize } from './marblizer';

describe('marblize()', () => {
    it('converts SubscriptionLog without completion to marbles', () => {
        const subscriptions: SubscriptionLog[] = [
            { subscribedFrame: 20, unsubscribedFrame: Infinity }
        ];

        expect(marblize(subscriptions)).toEqual(['--^']);
    });

    it('converts SubscriptionLog with completion to marbles', () => {
        const subscriptions: SubscriptionLog[] = [
            { subscribedFrame: 20, unsubscribedFrame: 80 }
        ];

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
