import { TestScheduler } from 'rxjs/testing';

export type ColdObservable<T> = ReturnType<typeof TestScheduler.prototype.createColdObservable<T>>;

export type HotObservable<T> = ReturnType<typeof TestScheduler.prototype.createHotObservable<T>>;

export type TestObservable<T> = ColdObservable<T> | HotObservable<T>;

/**
 * Exported return type of TestMessage[] to avoid importing internal APIs.
 */
export type TestMessages = ReturnType<typeof TestScheduler.parseMarbles>;

/**
 * Exported return type of SubscriptionLog to avoid importing internal APIs.
 */
export type SubscriptionLog = ReturnType<typeof TestScheduler.parseMarblesAsSubscriptions>;
