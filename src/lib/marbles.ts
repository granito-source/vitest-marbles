import { Scheduler } from './scheduler';
import { Subscription } from 'rxjs';
import { ColdObservable, HotObservable } from './types';

export function cold<T = string>(marbles: string,
    values?: Record<string, T>, error?: any): ColdObservable<T> {
    return Scheduler.get()
        .createColdObservable(marbles.trim(), values, error);
}

export function hot<T = string>(marbles: string,
    values?: Record<string, T>, error?: any): HotObservable<T> {
    return Scheduler.get()
        .createHotObservable(marbles.trim(), values, error) as HotObservable<T>;
}

export function time(marbles: string): number {
    return Scheduler.get()
        .createTime(marbles.trim());
}

export function schedule(work: () => void, delay: number): Subscription {
    return Scheduler.get()
        .schedule(work, delay);
}
