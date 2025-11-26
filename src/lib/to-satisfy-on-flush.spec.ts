import { cold } from './marbles';
import { tap } from 'rxjs';

describe('toSatisfyOnFlush', () => {
  it('should verify mock has been called', () => {
    const mock = vi.fn();
    const stream$ = cold('blah|').pipe(tap(mock));

    expect(stream$).toSatisfyOnFlush(() => {
      expect(mock).toHaveBeenCalledTimes(4);
    });
  });
});
