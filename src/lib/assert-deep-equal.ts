import { MessagesOrSubscriptions, SubscriptionLog } from './types';
import './internal-matchers';

export function assertDeepEqual(actual: MessagesOrSubscriptions,
    expected?: MessagesOrSubscriptions): void {
    if (!expected)
        return;

    if (expected.length !== 0) {
        if (isSubscriptions(expected))
            expect(actual).toBeSubscriptions(expected);
        else
            expect(actual).toBeNotifications(expected);
    } else if (actual.length !== 0) {
        if (isSubscriptions(actual))
            expect(actual).toHaveEmptySubscriptions();
        else
            expect(actual).toBeNotifications([]);
    }
}

function isSubscriptions(log: MessagesOrSubscriptions):
    log is SubscriptionLog[] {
    return (log[0] as any).subscribedFrame !== undefined;
}
