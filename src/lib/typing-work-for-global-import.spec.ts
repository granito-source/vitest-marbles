import { cold } from './marbles';

describe('', () => {
  it('Should have typing for expect imported from globals', () => {
    const a$ = cold('a', { a: 3 });

    expect(a$).toBeObservable(a$);
  });
});
