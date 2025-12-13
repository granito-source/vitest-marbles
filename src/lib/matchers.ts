import { Scheduler } from './scheduler';
import { TestScheduler } from 'rxjs/testing';
import { Observable } from 'rxjs';
import { ExpectationResult } from '@vitest/expect';
import { TestObservable } from './types';

interface CustomMatchers<R = unknown> {
    toBeObservable<T>(observable: Observable<T>, subscription?: string): R;

    toHaveSubscriptions(marbles: string | string[]): R;

    toHaveNoSubscriptions(): R;

    toBeMarble<T = string>(marbles: string, values?: Record<string, T>,
        error?: any): R;

    toSatisfyOnFlush(func: () => void): R;
}

declare module 'vitest' {
    interface Matchers<T = any> extends CustomMatchers<T> {
    }
}

const success: ExpectationResult = {
    pass: true,
    message: () => ''
};

expect.extend({
    toHaveSubscriptions<T>(actual: TestObservable<T>,
        marbles: string | string[]): ExpectationResult {
        const sanitizedMarbles = Array.isArray(marbles) ? marbles.map(m => m.trim()) : marbles.trim();

        Scheduler.get()
            .expectSubscriptions(actual.subscriptions).toBe(sanitizedMarbles);

        return success;
    },
    toHaveNoSubscriptions<T>(actual: TestObservable<T>): ExpectationResult {
        Scheduler.get()
            .expectSubscriptions(actual.subscriptions).toBe([]);

        return success;
    },
    toBeObservable<T>(actual: Observable<T>, expected: Observable<T>,
        subscription?: string): ExpectationResult {
        Scheduler.get()
            .expectObservable(actual, subscription).toEqual(expected);

        return success;
    },
    toBeMarble<T>(actual: Observable<T>, marbles: string,
        values?: Record<string, T>, error?: any): ExpectationResult {
        Scheduler.get()
            .expectObservable(actual).toBe(marbles.trim(), values, error);

        return success;
    },
    toSatisfyOnFlush<T>(actual: Observable<T>,
        func: () => void): ExpectationResult {
        Scheduler.get().expectObservable(actual);

        const flushTests = Scheduler.get()['flushTests'];

        flushTests[flushTests.length - 1].ready = true;
        onFlush.push(func);

        return success;
    }
});

let onFlush: (() => void)[] = [];

beforeEach(() => {
    Scheduler.init();
    onFlush = [];
});

afterEach(() => {
    Scheduler.get().run(() => TestScheduler.frameTimeFactor = 10);

    while (onFlush.length > 0)
        onFlush.shift()?.();

    Scheduler.reset();
});
