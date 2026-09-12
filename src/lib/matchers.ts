import { Scheduler } from './scheduler';
import { TestScheduler } from 'rxjs/testing';
import { Observable } from 'rxjs';
import { ExpectationResult } from '@vitest/expect';
import { TestObservable } from './types';
import { negateLast } from "./not";

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

const pass: ExpectationResult = {
    pass: true,
    message: () => ''
};

expect.extend({
    toHaveSubscriptions<T>(actual: TestObservable<T>,
        marbles: string | string[]): ExpectationResult {
        const sanitizedMarbles = Array.isArray(marbles) ?
            marbles.map(m => m.trim()) : marbles.trim();

        Scheduler.get()
            .expectSubscriptions(actual.subscriptions)
            .toBe(sanitizedMarbles);

        if (this.isNot)
            return negateLast();

        return pass;
    },
    toHaveNoSubscriptions<T>(actual: TestObservable<T>): ExpectationResult {
        Scheduler.get()
            .expectSubscriptions(actual.subscriptions).toBe([]);

        if (this.isNot)
            return negateLast();

        return pass;
    },
    toBeObservable<T>(actual: Observable<T>, expected: Observable<T>,
        subscription?: string): ExpectationResult {
        Scheduler.get()
            .expectObservable(actual, subscription).toEqual(expected);

        if (this.isNot)
            return negateLast();

        return pass;
    },
    toBeMarble<T>(actual: Observable<T>, marbles: string,
        values?: Record<string, T>, error?: any): ExpectationResult {
        Scheduler.get()
            .expectObservable(actual).toBe(marbles.trim(), values, error);

        if (this.isNot)
            return negateLast();

        return pass;
    },
    toSatisfyOnFlush<T>(actual: Observable<T>,
        func: () => void): ExpectationResult {
        if (this.isNot)
            throw new Error('.toSatisfyOnFlush() cannot be negated');

        const scheduler = Scheduler.get();
        const flushTests = scheduler['flushTests'];

        scheduler.expectObservable(actual);
        flushTests[flushTests.length - 1].ready = true;
        onFlush.push(func);

        return pass;
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
