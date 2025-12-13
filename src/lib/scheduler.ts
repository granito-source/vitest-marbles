import { TestScheduler } from 'rxjs/testing';
import { assertDeepEqual } from './assert-deep-equal';

export class Scheduler {
    public static instance?: TestScheduler;

    public static init(): void {
        Scheduler.instance = new TestScheduler(assertDeepEqual);
    }

    public static get(): TestScheduler {
        if (!Scheduler.instance)
            throw new Error('Scheduler is not initialized');

        return Scheduler.instance;
    }

    public static reset(): void {
        Scheduler.instance = undefined;
    }
}
