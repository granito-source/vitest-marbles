import { Scheduler } from './scheduler';
import { TestScheduler } from 'rxjs/testing';
import { SubscriptionLog, TestMessage } from './types';

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
            expect(() => assertDeepEqual([], undefined)).not.toThrowError();
            expect(() => assertDeepEqual(messages, undefined))
                .not.toThrowError();
            expect(() => assertDeepEqual(subscriptions, undefined))
                .not.toThrowError();
        });

        it('returns normally when expected and actual are empty', () => {
            expect(() => assertDeepEqual([], [])).not.toThrowError();
        });

        it('returns normally when the same subscriptions', () => {
            expect(() => assertDeepEqual(subscriptions, subscriptions))
                .not.toThrowError();
        });

        it('throws error when actual subscriptions but expected is empty', () => {
            const msg = new RegExp('Expected observable to have no ' +
                'subscription points.*But got:.*"-\\^-!".*"-----\\^"', 's');

            expect(() => assertDeepEqual(subscriptions, []))
                .toThrowError(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('throws error when actual is empty but expected subscriptions', () => {
            const msg = new RegExp('Expected observable to have the ' +
                'following subscription points:' +
                '.*"-\\^-!".*"-----\\^".*But got:.*\\[]', 's');

            expect(() => assertDeepEqual([], subscriptions))
                .toThrowError(expect.toSatisfy(e => msg.test(e.message)));
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
                .toThrowError(expect.toSatisfy(e => msg.test(e.message)));
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
                .toThrowError(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('returns normally when the same messages', () => {
            expect(() => assertDeepEqual(messages, messages))
                .not.toThrowError();
        });

        it('throws error when actual messages but expected is empty', () => {
            const msg = new RegExp('Expected notifications to be:' +
                '.*Array \\[].*But got:' +
                '.*"value": "b".*"value": "e".*Difference:', 's');

            expect(() => assertDeepEqual(messages, []))
                .toThrowError(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('throws error when actual empty but expected messages', () => {
            const msg = new RegExp('Expected notifications to be:' +
                '.*"value": "b".*"value": "e".*But got:' +
                '.*Array \\[].*Difference:', 's');

            expect(() => assertDeepEqual([], messages))
                .toThrowError(expect.toSatisfy(e => msg.test(e.message)));
        });

        it('throws error when actual and expected messages are different', () => {
            const actual: TestMessage[] = [
                ...messages,
                { frame: 60, notification: { kind: 'C' } }
            ];
            const msg = new RegExp('Expected notifications to be:' +
                '.*But got:.*"kind": "C".*Difference:', 's');

            expect(() => assertDeepEqual(actual, messages))
                .toThrowError(expect.toSatisfy(e => msg.test(e.message)));
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
                .toThrowError(expect.toSatisfy(e => msg.test(e.message)));
        });
    });
});
