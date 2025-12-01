import { Scheduler } from './rxjs/scheduler';
import { stripAlignmentChars } from './rxjs/strip-alignment-chars';
import { TestScheduler } from 'rxjs/testing';
import { Observable } from 'rxjs';
import { ExpectationResult } from '@vitest/expect';
import { TestObservable } from './rxjs/types';

interface CustomMatchers<R = unknown> {
  toBeObservable<T>(observable: Observable<T>): R;

  toHaveSubscriptions(marbles: string | string[]): R;

  toHaveNoSubscriptions(): R;

  toBeMarble(marble: string): R;

  toSatisfyOnFlush(func: () => void): R;
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {
  }
}

const dummyResult: ExpectationResult = {
  pass: true,
  message: () => ''
};

expect.extend({
  toHaveSubscriptions<T>(actual: TestObservable<T>, marbles: string | string[]): ExpectationResult {
    const sanitizedMarbles = Array.isArray(marbles) ? marbles.map(stripAlignmentChars) : stripAlignmentChars(marbles);
    Scheduler.get().expectSubscriptions(actual.subscriptions).toBe(sanitizedMarbles);

    return dummyResult;
  },
  toHaveNoSubscriptions<T>(actual: TestObservable<T>): ExpectationResult {
    Scheduler.get().expectSubscriptions(actual.subscriptions).toBe([]);

    return dummyResult;
  },
  toBeObservable<T>(actual: Observable<T>, expected: Observable<T>): ExpectationResult {
    Scheduler.get().expectObservable(actual).toEqual(expected);

    return dummyResult;
  },
  toBeMarble<T>(actual: Observable<T>, marbles: string): ExpectationResult {
    Scheduler.get().expectObservable(actual).toBe(stripAlignmentChars(marbles));

    return dummyResult;
  },
  toSatisfyOnFlush<T>(actual: Observable<T>, func: () => void): ExpectationResult {
    Scheduler.get().expectObservable(actual);

    const flushTests = Scheduler.get()['flushTests'];

    flushTests[flushTests.length - 1].ready = true;
    onFlush.push(func);

    return dummyResult;
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
