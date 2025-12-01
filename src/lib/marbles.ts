import { ColdObservable } from './rxjs/cold-observable';
import { HotObservable } from './rxjs/hot-observable';
import { Scheduler } from './rxjs/scheduler';
import { stripAlignmentChars } from './rxjs/strip-alignment-chars';
import { Subscription } from 'rxjs';

export function hot(marbles: string, values?: object, error?: object): HotObservable {
  return new HotObservable(stripAlignmentChars(marbles), values, error);
}

export function cold(marbles: string, values?: object, error?: object): ColdObservable {
  return new ColdObservable(stripAlignmentChars(marbles), values, error);
}

export function time(marbles: string): number {
  return Scheduler.get().createTime(stripAlignmentChars(marbles));
}

export function schedule(work: () => void, delay: number): Subscription {
  return Scheduler.get().schedule(work, delay);
}
