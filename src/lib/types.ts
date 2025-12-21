import { ColdObservable } from "rxjs/internal/testing/ColdObservable";
import { HotObservable } from "rxjs/internal/testing/HotObservable";
import { SubscriptionLog } from "rxjs/internal/testing/SubscriptionLog";
import { TestMessage } from "rxjs/internal/testing/TestMessage";

export type TestObservable<T> = ColdObservable<T> | HotObservable<T>;

export type MessagesOrSubscriptions = TestMessage[] | SubscriptionLog[];

export type { SubscriptionLog, TestMessage };

export { ColdObservable, HotObservable };
