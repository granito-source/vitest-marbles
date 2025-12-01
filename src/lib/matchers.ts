import { ColdObservable } from './rxjs/cold-observable';
import { HotObservable } from './rxjs/hot-observable';
import { Scheduler } from './rxjs/scheduler';
import { stripAlignmentChars } from './rxjs/strip-alignment-chars';
import { TestScheduler } from 'rxjs/testing';

export type ObservableWithSubscriptions = ColdObservable | HotObservable;

interface CustomMatchers<R = unknown> {
  toBeObservable(observable: ObservableWithSubscriptions): R;

  toHaveSubscriptions(marbles: string | string[]): R;

  toHaveNoSubscriptions(): R;

  toBeMarble(marble: string): R;

  toSatisfyOnFlush(func: () => void): R;
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {
  }
}

const dummyResult = {
  pass: true,
  message: () => '',
};

expect.extend({
  toHaveSubscriptions(actual: ObservableWithSubscriptions, marbles: string | string[]) {
    const sanitizedMarbles = Array.isArray(marbles) ? marbles.map(stripAlignmentChars) : stripAlignmentChars(marbles);
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe(sanitizedMarbles);

    return dummyResult;
  },
  toHaveNoSubscriptions(actual: ObservableWithSubscriptions) {
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe([]);

    return dummyResult;
  },
  toBeObservable(actual, expected: ObservableWithSubscriptions) {
    Scheduler.get().expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);

    return dummyResult;
  },
  toBeMarble(actual: ObservableWithSubscriptions, marbles: string) {
    Scheduler.get().expectObservable(actual).toBe(stripAlignmentChars(marbles));

    return dummyResult;
  },
  toSatisfyOnFlush(actual: ObservableWithSubscriptions, func: () => void) {
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
