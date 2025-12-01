import { cold, hot, schedule, time } from './marbles';
import './matchers';
import { concat, delay, map, merge, Subject, switchAll, switchMap, tap, timer } from 'rxjs';
import { Scheduler } from './scheduler';

describe('toBeMarble()', () => {
  it('concatenates two cold observables into single cold observable', () => {
    const a$ = cold('-a-|');
    const b$ = cold('-b-|');
    const expected = '-a--b-|';

    expect(concat(a$, b$)).toBeMarble(expected);
  });

  it('merges two hot observables and start emitting from the subscription point', () => {
    const e1$ = hot('----a--^--b-------c--|');
    const e2$ = hot('---d-^--e---------f-----|');
    const expected = '---(be)----c-f-----|';

    expect(merge(e1$, e2$)).toBeMarble(expected);
  });

  it('delays the emission by provided timeout with provided scheduler', () => {
    const delay$ = time('-----a|');
    const provided$ = timer(delay$, Scheduler.get()).pipe(map(() => 'a'));
    const expected = '------(a|)';

    expect(provided$).toBeMarble(expected);
  });

  it('ignores whitespace to allow vertical alignment', () => {
    const hotInput$ = hot('   --a|');
    const coldInput$ = cold(' --a|');
    const expected = '        --a|';

    expect(hotInput$).toBeMarble(expected);
    expect(coldInput$).toBeMarble(expected);
  });
});

describe('toBeObservable()', () => {
  it('concatenates two cold observables into single cold observable', () => {
    const a$ = cold('-a-|', { a: 0 });
    const b$ = cold('-b-|', { b: 1 });
    const expected = cold('-a--b-|', { a: 0, b: 1 });

    expect(concat(a$, b$)).toBeObservable(expected);
  });

  it('works for value objects', () => {
    const valueObject = { foo: 'bar' };
    const a$ = cold('-a-|', { a: valueObject });
    const expected = cold('-a-|', { a: valueObject });

    expect(a$).toBeObservable(expected);
  });

  it('works for multi-character literals', () => {
    const falses$ = cold('--a-----b-----|');
    const trues$ = cold('-----a-----b--|');
    const expected = cold('--f--t--f--t--|', { t: true, f: false });
    const mapped = merge(falses$.pipe(map(() => false)), trues$.pipe(map(() => true)));

    expect(mapped).toBeObservable(expected);
  });

  it('works for mixed literals', () => {
    const falses$ = cold('--a-----a-----|', { a: false });
    const trues$ = cold('-----b-----b--|', { b: true });
    const characters$ = cold('-------------c-|');
    const expected = cold('--f--t--f--t-c-|', { t: true, f: false, c: 'c' });
    const mapped = merge(falses$, trues$, characters$);

    expect(mapped).toBeObservable(expected);
  });

  it('works with undefined values', () => {
    const values$ = cold('u|', { u: undefined });
    const expected = cold('u|', { u: undefined });

    expect(values$).toBeObservable(expected);
  });

  it('merges two hot observables and start emitting from the subscription point', () => {
    const e1 = hot('----a--^--b-------c--|');
    const e2 = hot('---d-^--e---------f-----|');
    const expected = cold('---(be)----c-f-----|');

    expect(merge(e1, e2)).toBeObservable(expected);
  });

  it('delays the emission by provided timeout with provided scheduler', () => {
    const delay = time('-----d|');
    const provided = timer(delay, Scheduler.get()).pipe(map(() => 0));
    const expected = hot('------(d|)', { d: 0 });

    expect(provided).toBeObservable(expected);
  });

  it('ignores whitespace to allow vertical alignment', () => {
    const hotInput = hot('  ---^--a|');
    const coldInput = cold('   ---a|');
    const expected = cold('    ---a|');

    expect(hotInput).toBeObservable(expected);
    expect(coldInput).toBeObservable(expected);
  });

  it('works with asymmetric matchers', () => {
    const e$ = hot('-a', { a: { someprop: 'hey', x: { y: 1, z: 2 }, blah: '3' } });

    expect(e$).toBeObservable(
      cold('-b', {
        b: expect.objectContaining({
          x: expect.objectContaining({
            y: 1,
          }),
          blah: '3',
        }),
      })
    );
  });

  it('works with schedule()', () => {
    const source = new Subject<string>();

    schedule(() => source.next('a'), 1);
    schedule(() => source.next('b'), 2);

    const expected = cold('ab');

    expect(source).toBeObservable(expected);
  });

  it('works with delays', () => {
    const source = cold('a');
    const expected = cold('--a');

    expect(source.pipe(delay(20))).toBeObservable(expected);
  });

  it('passes if the two objects have the same properties but in different order', () => {
    const e$ = hot('-a', { a: { someprop: 'hey', b: 1 } });

    expect(e$).toBeObservable(cold('-b', { b: { b: 1, someprop: 'hey' } }));
  });

  it('Should work with cold observables created during assertion execution', () => {
    const source = cold('a').pipe(switchMap(() => cold('--a')));
    const expected = cold('--a');

    expect(source).toBeObservable(expected);
  });

  // TODO: uncomment once .not.toBeObservable works
  // it('fails on different errors', () => {
  //   expect(cold('#', {}, 'A')).not.toBeObservable(cold('#', {}, 'B'))
  // })
});

describe('toHaveSubscriptions()', () => {
  it('figures out single subscription points', () => {
    const x = cold('--a---b---c--|');
    const xsubs = '------^-------!';
    const y = cold('---d--e---f---|');
    const ysubs = '--------------^-------------!';
    const e1 = hot('------x-------y------|', { x, y });
    const expected = cold('--------a---b----d--e---f---|');

    expect(e1.pipe(switchAll())).toBeObservable(expected);
    expect(x).toHaveSubscriptions(xsubs);
    expect(y).toHaveSubscriptions(ysubs);
  });

  it('figures out multiple subscription points', () => {
    const x = cold('--a---b---c--|');

    const y = cold('----x---x|', { x });
    const ySubscription1 = '----^---!';
    //                                     '--a---b---c--|'
    const ySubscription2 = '--------^------------!';
    const expectedY = cold('------a---a---b---c--|');

    const z = cold('-x|', { x });
    //                                 '--a---b---c--|'
    const zSubscription = '-^------------!';
    const expectedZ = cold('---a---b---c--|');

    expect(y.pipe(switchAll())).toBeObservable(expectedY);
    expect(z.pipe(switchAll())).toBeObservable(expectedZ);

    expect(x).toHaveSubscriptions([ySubscription1, ySubscription2, zSubscription]);
  });

  it('verifies that switchMap was not performed due to an error', () => {
    const x = cold('--a---b---c--|');
    const y = cold('---#-x--', { x });
    const result = y.pipe(switchAll());

    expect(result).toBeMarble('---#');
    expect(x).toHaveNoSubscriptions();
  });

  // it('Should verify that there is at least one subscription', () => {
  //   const x = cold('--a---b---c--|');
  //   expect(x).not.toHaveNoSubscriptions();
  // });

  it('ignores whitespace to allow vertical alignment', () => {
    const x = hot('          -----a|');
    const expected = '       -----a|';
    const xSubscription = '  ^-----!';

    expect(x).toBeMarble(expected);
    expect(x).toHaveSubscriptions(xSubscription);
    expect(x).toHaveSubscriptions([xSubscription]);
  });
});

describe('toSatisfyOnFlush()', () => {
  it('should verify mock has been called', () => {
    const mock = vi.fn();
    const stream$ = cold('blah|').pipe(tap(mock));

    expect(stream$).toSatisfyOnFlush(() => {
      expect(mock).toHaveBeenCalledTimes(4);
    });
  });
});
