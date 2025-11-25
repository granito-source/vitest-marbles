import { cold, hot, Scheduler, time } from '../index';
import { concat, map, merge, timer } from 'rxjs';

describe('To be marble matcher', () => {
  it('Should concatenate two cold observables into single cold observable', () => {
    const a$ = cold('-a-|');
    const b$ = cold('-b-|');
    const expected = '-a--b-|';

    expect(concat(a$, b$)).toBeMarble(expected);
  });

  it('Should merge two hot observables and start emitting from the subscription point', () => {
    const e1$ = hot('----a--^--b-------c--|');
    const e2$ = hot('---d-^--e---------f-----|');
    const expected = '---(be)----c-f-----|';

    expect(merge(e1$, e2$)).toBeMarble(expected);
  });

  it('Should delay the emission by provided timeout with provided scheduler', () => {
    const delay$ = time('-----a|');
    const provided$ = timer(delay$, Scheduler.get()).pipe(map(() => 'a'));
    const expected = '------(a|)';

    expect(provided$).toBeMarble(expected);
  });

  it('Should ignore whitespace to allow vertical alignment', () => {
    const hotInput$ = hot('   --a|');
    const coldInput$ = cold(' --a|');
    const expected = '       --a|';

    expect(hotInput$).toBeMarble(expected);
    expect(coldInput$).toBeMarble(expected);
  });
});
