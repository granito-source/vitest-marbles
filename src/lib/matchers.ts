import { ColdObservable } from './rxjs/cold-observable';
import { HotObservable } from './rxjs/hot-observable';
import { Scheduler } from './rxjs/scheduler';
import { stripAlignmentChars } from './rxjs/strip-alignment-chars';
import { TestScheduler } from 'rxjs/testing';
import { Observable } from 'rxjs';
import { ExpectationResult } from '@vitest/expect';

export type ObservableWithSubscriptions<T> = ColdObservable<T> | HotObservable<T>;

interface CustomMatchers<R = unknown> {
  toBeObservable<T>(observable: ObservableWithSubscriptions<T>): R;

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
  message: () => '',
};

expect.extend({
  toHaveSubscriptions<T>(actual: ObservableWithSubscriptions<T>, marbles: string | string[]): ExpectationResult {
    const sanitizedMarbles = Array.isArray(marbles) ? marbles.map(stripAlignmentChars) : stripAlignmentChars(marbles);
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe(sanitizedMarbles);

    return dummyResult;
  },
  toHaveNoSubscriptions<T>(actual: ObservableWithSubscriptions<T>): ExpectationResult {
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe([]);

    return dummyResult;
  },
  toBeObservable<T>(actual: Observable<T>, expected: ObservableWithSubscriptions<T>): ExpectationResult {
    Scheduler.get().expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);

    return dummyResult;
  },
  toBeMarble<T>(actual: ObservableWithSubscriptions<T>, marbles: string): ExpectationResult {
    Scheduler.get().expectObservable(actual).toBe(stripAlignmentChars(marbles));

    return dummyResult;
  },
  toSatisfyOnFlush<T>(actual: ObservableWithSubscriptions<T>, func: () => void): ExpectationResult {
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
