import { Scheduler } from './scheduler';

describe('Scheduler', () => {
  afterEach(() => Scheduler.init());

  it('throws Error on #get() if it is not initialized', () => {
    Scheduler.reset();

    expect(() => Scheduler.get()).toThrow(new Error('Scheduler is not initialized'));
  });
});
