import { MessagesOrSubscriptions, SubscriptionLog } from './types';
import './internal-matchers';
import { affirm, negated } from "./not";

export function assertDeepEqual(actual: MessagesOrSubscriptions,
    expected?: any[]): void {
    if (!expected)
        return;

    if (negated(expected)) {
        const exp = affirm(expected);

        try {
            assertDeepEqual(actual, exp);
        } catch {
            return;
        }

        throw new Error(
            'Expected observables to differ, but they matched.\n' +
            `  Received: ${JSON.stringify(actual)}\n` +
            `  Not expected: ${JSON.stringify(exp)}`
        );
    }

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
