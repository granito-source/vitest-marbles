import { cold, hot, schedule } from './marbles';
import './matchers';
import { Subject, switchAll } from 'rxjs';
import { Scheduler } from './scheduler';

describe('Matchers', () => {
  const error = new Error('error');

  it('initializes Scheduler', () => {
    expect(() => Scheduler.get()).not.toThrowError();
  });

  describe('#toHaveSubscriptions()', () => {
    it('matches single subscription points', () => {
      const x = cold('           --a---b---c--|');
      const y = cold('                   ---d--e---f---|');
      const control = hot('------x-------y------|', { x, y });
      const xSubs = '      ------^-------!';
      const ySubs = '      --------------^-------------!';

      control.pipe(switchAll()).subscribe();

      expect(x).toHaveSubscriptions(xSubs);
      expect(y).toHaveSubscriptions(ySubs);
    });

    it('matches multiple subscription points', () => {
      const x = cold('           --a---b---c--|');
      //                             --a---b---c--|
      //                      --a---b---c--|
      const control1 = cold('----x---x|', { x });
      const control2 = cold('-x|', { x });
      const subs1 = '        ----^---!';
      const subs2 = '        --------^------------!';
      const subs3 = '        -^------------!';

      control1.pipe(switchAll()).subscribe();
      control2.pipe(switchAll()).subscribe();

      expect(x).toHaveSubscriptions([subs1, subs2, subs3]);
    });

    it('matches no subscriptions', () => {
      expect(cold('---a')).toHaveSubscriptions([]);
    });
  });

  describe('#toHaveNoSubscriptions()', () => {
    it('matches no subscriptions', () => {
      expect(cold('---a')).toHaveNoSubscriptions();
    });
  });

  describe('#toBeObservable()', () => {
    it('matches actual test observable with expected test observable', () => {
      expect(cold('--a-(bc)')).toBeObservable(cold('--a-(bc)'));
      expect(cold('--a-(bc)')).toBeObservable(hot('--a-(bc)'));
      expect(hot('--a-(bc)')).toBeObservable(cold('--a-(bc)'));
      expect(hot('--a-(bc)')).toBeObservable(hot('--a-(bc)'));
    });

    it('matches actual test with values with expected test observable', () => {
      expect(cold('--a-', { a: 42 })).toBeObservable(cold('--a-', { a: 42 }));
      expect(cold('--a-', { a: 42 })).toBeObservable(hot('--a-', { a: 42 }));
      expect(hot('--a-', { a: 42 })).toBeObservable(cold('--a-', { a: 42 }));
      expect(hot('--a-', { a: 42 })).toBeObservable(hot('--a-', { a: 42 }));
    });

    it('matches actual completed test with expected test observable', () => {
      expect(cold('--a-|')).toBeObservable(cold('--a-|'));
      expect(cold('--a-|')).toBeObservable(hot('--a-|'));
      expect(hot('--a-|')).toBeObservable(cold('--a-|'));
      expect(hot('--a-|')).toBeObservable(hot('--a-|'));
    });

    it('matches actual errored out test observable with expected test observable', () => {
      expect(cold('--a-#', undefined, error)).toBeObservable(cold('--a-#', undefined, error));
      expect(cold('--a-#', undefined, error)).toBeObservable(hot('--a-#', undefined, error));
      expect(hot('--a-#', undefined, error)).toBeObservable(cold('--a-#', undefined, error));
      expect(hot('--a-#', undefined, error)).toBeObservable(hot('--a-#', undefined, error));
    });

    it('matches actual real observable with expected test observable', () => {
      const actual = new Subject<string>();

      schedule(() => actual.next('a'), 20);
      schedule(() => actual.next('b'), 60);
      schedule(() => actual.complete(), 70);

      expect(actual).toBeObservable(cold('--a---b|'));
      expect(actual).toBeObservable(hot('--a---b|'));
    });

    it('matches actual test observable with expected real observable', () => {
      const expected = new Subject<string>();

      schedule(() => expected.next('a'), 20);
      schedule(() => expected.next('b'), 60);
      schedule(() => expected.complete(), 70);

      expect(cold('--a---b|')).toBeObservable(expected);
      expect(hot('--a---b|')).toBeObservable(expected);
    });

    it('matches with observable and subscription', () => {
      // matches on 'de'
      expect(hot('abc^de')).toBeObservable(hot('cdefg'), '-^-!');
      expect(hot('abc^de')).toBeObservable(cold('defg'), '-^-!');
    });

    it('allows using matchers for values', () => {
      let actual = cold('--a-', {
        a: {
          answer: 42,
          question: undefined
        }
      });

      expect(actual).toBeObservable(cold('--a-', {
        a: expect.objectContaining({ answer: 42 })
      }));
    });
  });

  describe('#toBeMarble()', () => {
    it('matches marble observables', () => {
      expect(cold('--a-b--c')).toBeMarble('--a-b--c');
      expect(hot('--a-b--c')).toBeMarble('--a-b--c');
    });

    it('matches observables with values', () => {
      expect(cold('--a-', { a: 42 })).toBeMarble('--a-', { a: 42 });
      expect(hot('--a-', { a: 42 })).toBeMarble('--a-', { a: 42 });
    });

    it('matches terminated observables', () => {
      expect(cold('--(ab)--|')).toBeMarble('--(ab)--|');
      expect(hot('--(ab)--|')).toBeMarble('--(ab)--|');
    });

    it('matches errored out observables', () => {
      expect(cold('--a-#', undefined, error)).toBeMarble('--a-#', undefined, error);
      expect(hot('--a-#', undefined, error)).toBeMarble('--a-#', undefined, error);
    });

    it('trims whitespace from expected marbles', () => {
      expect(cold('--a-')).toBeMarble('  --a- ');
    });
  });

  describe('#toSatisfyOnFlush()', () => {
    it('checks expectations after scheduler is flushed', () => {
      const func = vi.fn();

      cold('--a-b-c').subscribe(func);
      schedule(() => func('d'), 100);

      expect(cold('')).toSatisfyOnFlush(() => {
        expect(func).toHaveBeenCalledTimes(4);
        expect(func).toHaveBeenCalledWith('a');
        expect(func).toHaveBeenCalledWith('b');
        expect(func).toHaveBeenCalledWith('c');
        expect(func).toHaveBeenCalledWith('d');
      });
    });
  });
});
