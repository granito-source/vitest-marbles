import { hot, time } from './marbles';
import './matchers';
import { map, timer } from 'rxjs';
import { Scheduler } from './rxjs/scheduler';

describe('time()', () => {
  it('delays the emission by provided timeout with provided scheduler', () => {
    const delay$ = time('-----d|');
    const provided$ = timer(delay$, Scheduler.get()).pipe(map(() => 0));
    const expected$ = hot('------(d|)', { d: 0 });

    expect(provided$).toBeObservable(expected$);
  });

  it('ignores whitespace to allow vertical alignment', () => {
    const referenceDelay$ = time('-----d|');
    const alignedDelay$ = time('  -----d|');

    expect(alignedDelay$).toBe(referenceDelay$);
  });
});
