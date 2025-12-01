import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { SubscriptionLog } from './types';
import { Scheduler } from './scheduler';

export class HotObservable<T> extends Observable<T> {
  override source: ReturnType<TestScheduler['createHotObservable']>;

  constructor(public marbles: string, public values?: Record<string, T>, public error?: any) {
    super();

    this.source = Scheduler.get().createHotObservable(marbles, values, error) as any;
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions;
  }
}
