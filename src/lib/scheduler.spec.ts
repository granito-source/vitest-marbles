import { Scheduler } from './scheduler';
import { TestScheduler } from 'rxjs/testing';
import { SubscriptionLog, TestMessage } from './types';
import { negate } from "./not";

describe('Scheduler', () => {
    beforeEach(() => Scheduler.init());

    afterEach(() => Scheduler.reset());

    it('provides TestScheduler when initialized', () => {
        expect(Scheduler.get()).toBeInstanceOf(TestScheduler);
    });

    it('throws Error on #get() if it is not initialized', () => {
        Scheduler.reset();

        expect(() => Scheduler.get())
            .toThrow(new Error('Scheduler is not initialized'));
    });

    describe('TestScheduler#assertDeepEqual()', () => {
        const subscriptions: SubscriptionLog[] = [
            { subscribedFrame: 10, unsubscribedFrame: 30 },
            { subscribedFrame: 50, unsubscribedFrame: Infinity }
        ];
        const messages: TestMessage[] = [
            { frame: 20, notification: { kind: 'N', value: 'b' } },
            { frame: 50, notification: { kind: 'N', value: 'e' } }
        ];
        let assertDeepEqual: (actual: any, expected: any) => void;

        beforeEach(() => assertDeepEqual = Scheduler.get().assertDeepEqual);

        it('returns normally when expected is undefined', () => {
            expect(() => assertDeepEqual([], undefined)).not.toThrow();
            expect(() => assertDeepEqual(messages, undefined))
                .not.toThrow();
            expect(() => assertDeepEqual(subscriptions, undefined))
                .not.toThrow();
        });

        it('returns normally when expected and actual are empty', () => {
            expect(() => assertDeepEqual([], [])).not.toThrow();
        });

        it('throws error when actual is empty but expected is "not" empty', () => {
            const msg = new RegExp('Expected observables to differ, ' +
                'but they matched.*Received: \\[].*' +
                'Not expected: \\[]', 's');

            expect(() => assertDeepEqual([], negate([])))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('returns normally when subscriptions are the same', () => {
            expect(() => assertDeepEqual(subscriptions, subscriptions))
                .not.toThrow();
        });

        it('throws error when actual subscriptions but they are "not" expected', () => {
            const msg = new RegExp('Expected observables to differ, ' +
                'but they matched.*Received: \\[{.*' +
                'Not expected: \\[{', 's');

            expect(() => assertDeepEqual(subscriptions, negate(subscriptions)))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('throws error when actual subscriptions but expected is empty', () => {
            const msg = new RegExp('Expected observable to have no ' +
                'subscription points.*But got:.*"-\\^-!".*"-----\\^"', 's');

            expect(() => assertDeepEqual(subscriptions, []))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('returns normally when actual subscriptions and expected is "not" empty', () => {
            expect(() => assertDeepEqual(subscriptions, negate([])))
                .not.toThrow();
        });

        it('throws error when actual is empty but expecting subscriptions', () => {
            const msg = new RegExp('Expected observable to have the ' +
                'following subscription points:' +
                '.*"-\\^-!".*"-----\\^".*But got:.*\\[]', 's');

            expect(() => assertDeepEqual([], subscriptions))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('returns normally when actual is empty and "not" expecting subscriptions', () => {
            expect(() => assertDeepEqual([], negate(subscriptions)))
                .not.toThrow();
        });

        it('throws error when actual and expected subscriptions have different length', () => {
            const actual = [
                { subscribedFrame: 0, unsubscribedFrame: 20 },
                ...subscriptions
            ];
            const msg = new RegExp('Expected observable to have the ' +
                'following subscription points:' +
                '.*"-\\^-!".*"-----\\^".*But got:' +
                '.*"\\^-!".*"-\\^-!".*"-----\\^".*Difference:', 's');

            expect(() => assertDeepEqual(actual, subscriptions))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('throws error when actual and expected subscriptions do not match', () => {
            const actual = [
                { subscribedFrame: 0, unsubscribedFrame: 20 },
                { subscribedFrame: 50, unsubscribedFrame: Infinity }
            ];
            const msg = new RegExp('Expected observable to have the ' +
                'following subscription points:' +
                '.*"-\\^-!".*"-----\\^".*But got:' +
                '.*"\\^-!".*"-----\\^".*Difference:', 's');

            expect(() => assertDeepEqual(actual, subscriptions))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('returns normally when actual subscriptions are "not" expected to be the same', () => {
            const actual = [
                { subscribedFrame: 0, unsubscribedFrame: 20 },
                ...subscriptions
            ];

            expect(() => assertDeepEqual(actual, negate(subscriptions)))
                .not.toThrow();
        });

        it('returns normally when messages are the same', () => {
            expect(() => assertDeepEqual(messages, messages))
                .not.toThrow();
        });

        it('throws error when actual messages but expected are "not" the same', () => {
            const msg = new RegExp('Expected observables to differ, ' +
                'but they matched.*Received: \\[{.*' +
                'Not expected: \\[{', 's');

            expect(() => assertDeepEqual(messages, negate(messages)))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('throws error when actual messages but expected is empty', () => {
            const msg = new RegExp('Expected notifications to be:' +
                '.*Array \\[].*But got:' +
                '.*"value": "b".*"value": "e".*Difference:', 's');

            expect(() => assertDeepEqual(messages, []))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('returns normally when actual messages and expected is "not" empty', () => {
            expect(() => assertDeepEqual(messages, negate([])))
                .not.toThrow();
        });

        it('throws error when actual is empty but expecting messages', () => {
            const msg = new RegExp('Expected notifications to be:' +
                '.*"value": "b".*"value": "e".*But got:' +
                '.*Array \\[].*Difference:', 's');

            expect(() => assertDeepEqual([], messages))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('returns normally when actual is empty and "not" expecting messages', () => {
            expect(() => assertDeepEqual([], negate(messages)))
                .not.toThrow();
        });

        it('throws error when actual and expected messages are different', () => {
            const actual: TestMessage[] = [
                ...messages,
                { frame: 60, notification: { kind: 'C' } }
            ];
            const msg = new RegExp('Expected notifications to be:' +
                '.*But got:.*"kind": "C".*Difference:', 's');

            expect(() => assertDeepEqual(actual, messages))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('throws error when actual and expected values are different', () => {
            const actual: TestMessage[] = [
                { frame: 20, notification: { kind: 'N', value: 43 } }
            ];
            const expected: TestMessage[] = [
                { frame: 20, notification: { kind: 'N', value: 42 } }
            ];
            const msg = new RegExp('Expected notifications to be:' +
                '.*Array \\[.*"value": 42.*But got:' +
                '.*Array \\[.*"value": 43.*Difference', 's');

            expect(() => assertDeepEqual(actual, expected))
                .toThrow(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('returns normally when actual messages are "not" expected to be the same', () => {
            const actual: TestMessage[] = [
                ...messages,
                { frame: 60, notification: { kind: 'C' } }
            ];

            expect(() => assertDeepEqual(actual, negate(messages)))
                .not.toThrow();
        });
    });
});
