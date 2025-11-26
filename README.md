[![Build](https://github.com/granito-source/vitest-marbles/actions/workflows/build.yaml/badge.svg)](https://github.com/granito-source/vitest-marbles/actions/workflows/build.yaml)
[![Latest Version](https://img.shields.io/npm/v/%40granito%2Fvitest-marbles.svg)](https://npm.im/@granito/vitest-marbles)

# Vitest Marbles

A set of helper functions and [Vitest](http://vitest.dev/) matchers for
[RxJs](https://rxjs.dev/)
[marble testing](https://rxjs.dev/guide/testing/marble-testing).
This library will help you to test your reactive code in easy and
clean way.

# Features

* Typescript;
* marblized error messages.

# Prerequisites

* Vitest;
* RxJS;
* familiarity with
  [marbles syntax](https://rxjs.dev/guide/testing/marble-testing).

# Not supported

* time progression syntax.

# Usage

```shell
npm install --save-dev @granito/vitest-marbles
```

In the test file:

```typescript
import { cold, hot, time, schedule } from '@granito/vitest-marbles';
```

Inside the test:

```typescript
expect(stream).toBeObservable(expected);
expect(stream).toBeMarble(marbleString);
expect(stream).toHaveSubscriptions(marbleString);
expect(stream).toHaveSubscriptions(marbleStringsArray);
expect(stream).toHaveNoSubscriptions();
expect(stream).toSatisfyOnFlush(() => {
    expect(someMock).toHaveBeenCalled();
});
```

# Examples

## toBeObservable()

Verifies that the resulting stream emits certain values at certain time
frames.

```typescript
    it('merges two hot observables and start emitting from the subscription point', () => {
        const e1 = hot('----a--^--b-------c--|', {a: 0});
        const e2 = hot('  ---d-^--e---------f-----|', {a: 0});
        const expected = cold('---(be)----c-f-----|', {a: 0});

        expect(e1.pipe(merge(e2))).toBeObservable(expected);
    });
```

Sample output when the test fails (if change the expected result to
`'-d--(be)----c-f-----|'`).

```text
Expected notifications to be:
  "-d--(be)----c-f-----|"
But got:
  "---(be)----c-f-----|"
```

## toBeMarble()

Same as `toBeObservable()` but receives marble string instead.

```js
    it('concatenates two cold observables into single cold observable', () => {
        const a = cold('-a-|');
        const b = cold('-b-|');
        const expected = '-a--b-|';

        expect(a.pipe(concat(b))).toBeMarble(expected);
    });
```

## toHaveSubscriptions()

Verifies that the observable was subscribed in the provided time frames.
Useful, for example, when you want to verify that particular
`switchMap()` worked as expected.

```typescript
    it('Should figure out single subscription points', () => {
        const x = cold('        --a---b---c--|');
        const xsubs = '   ------^-------!';
        const y = cold('                ---d--e---f---|');
        const ysubs = '   --------------^-------------!';
        const e1 = hot('  ------x-------y------|', { x, y });
        const expected = cold('--------a---b----d--e---f---|');

        expect(e1.pipe(switchAll())).toBeObservable(expected);
        expect(x).toHaveSubscriptions(xsubs);
        expect(y).toHaveSubscriptions(ysubs);
    });
```
The matcher can also accept multiple subscription marbles.

```typescript
    it('figures out multiple subscription points', () => {
        const x = cold('                    --a---b---c--|');
        const y = cold('                ----x---x|', {x});
        const ySubscription1 = '        ----^---!';
        //                                     '--a---b---c--|'
        const ySubscription2 = '        --------^------------!';
        const expectedY = cold('        ------a---a---b---c--|');
        const z = cold('                   -x|', {x});
        //                                 '--a---b---c--|'
        const zSubscription = '            -^------------!';
        const expectedZ = cold('           ---a---b---c--|');

        expect(y.pipe(switchAll())).toBeObservable(expectedY);
        expect(z.pipe(switchAll())).toBeObservable(expectedZ);
        expect(x).toHaveSubscriptions([
            ySubscription1,
            ySubscription2,
            zSubscription
        ]);
    });
```
Sample output when the test fails (if change `ySubscription1` to
`'-----------------^---!'`).

```text
Expected observable to have the following subscription points:
  ["-----------------^---!", "--------^------------!", "-^------------!"]
But got:
  ["-^------------!", "----^---!", "--------^------------!"]
```

## toHaveNoSubscriptions()

Verifies that the observable was not subscribed during the test.
Especially useful when you want to verify that certain chain was not
called due to an error:

```typescript
    it('verifies that switchMap() was not performed due to an error', () => {
        const x = cold('--a---b---c--|');
        const y = cold('---#-x--', {x});
        const result = y.pipe(switchAll());

        expect(result).toBeMarble('---#');
        expect(x).toHaveNoSubscriptions();
    });
```

Sample output when the test fails (if remove error and change the
expected marble to `'------a---b---c--|'`).

```
Expected observable to have no subscription points
But got:
  ["----^------------!"]
```

## toSatisfyOnFlush()

Allows you to assert on certain side effects/conditions that should be
satisfied when the observable has been flushed (finished).

```typescript
    it('verifies mock has been called', () => {
        const mock = vi.fn();
        const stream$ = cold('blah|').pipe(tap(mock));

        expect(stream$).toSatisfyOnFlush(() => {
            expect(mock).toHaveBeenCalledTimes(4);
        });
    });
```

## schedule()

Allows you to schedule task on specified frame.

```typescript
    it('verifies subject values', () => {
        const source = new Subject();
        const expected = cold('ab');

        schedule(() => source.next('a'), 1);
        schedule(() => source.next('b'), 2);

        expect(source).toBeObservable(expected);
    });
```

# Credits

This repository has been forked from <https://github.com/just-jeb/jest-marbles>
by _Jenia "JeB" Barabanov_ and updated to use Vitest instead of Jest.
