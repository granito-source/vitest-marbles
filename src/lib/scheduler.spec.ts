import { Scheduler } from './scheduler';
import { TestScheduler } from 'rxjs/testing';

describe('Scheduler', () => {
  afterEach(() => Scheduler.reset());

  it('provides TestScheduler when initialized', () => {
    Scheduler.init();

    expect(Scheduler.get()).toBeInstanceOf(TestScheduler);
  });

  it('throws Error on #get() if it is not initialized', () => {
    Scheduler.reset();

    expect(() => Scheduler.get()).toThrow(new Error('Scheduler is not initialized'));
  });
});
