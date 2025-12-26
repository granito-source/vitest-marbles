import { TestScheduler } from 'rxjs/testing';
import { assertDeepEqual } from './assert-deep-equal';

export class Scheduler {
    private static instance?: TestScheduler;

    static init(): void {
        Scheduler.instance = new TestScheduler(assertDeepEqual);
    }

    static get(): TestScheduler {
        if (!Scheduler.instance)
            throw new Error('Scheduler is not initialized');

        return Scheduler.instance;
    }

    static reset(): void {
        Scheduler.instance = undefined;
    }
}
