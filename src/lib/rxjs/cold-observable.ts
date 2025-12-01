import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { SubscriptionLog } from './types';
import { Scheduler } from './scheduler';

export class ColdObservable<T> extends Observable<T> {
  override source: ReturnType<TestScheduler['createColdObservable']>;

  constructor(public marbles: string, public values?: Record<string, T>, public error?: any) {
    super();

    this.source = Scheduler.get().createColdObservable(marbles, values, error);
  }

  getSubscriptions(): SubscriptionLog[] {
    return this.source.subscriptions;
  }
}
