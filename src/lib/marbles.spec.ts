import { cold, hot, schedule, time } from './marbles';
import { Scheduler } from './scheduler';
import { TestScheduler } from 'rxjs/testing';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { HotObservable } from 'rxjs/internal/testing/HotObservable';
import { Subscription } from 'rxjs';

describe('Marbles', () => {
    let testScheduler: TestScheduler;

    beforeAll(() => {
        testScheduler = new TestScheduler(() => false);
        vi.spyOn(testScheduler, 'createColdObservable');
        vi.spyOn(testScheduler, 'createHotObservable');
        vi.spyOn(testScheduler, 'createTime');
        vi.spyOn(testScheduler, 'schedule');
        vi.spyOn(Scheduler, 'get').mockImplementation(() => testScheduler);
    });

    beforeEach(() => vi.clearAllMocks());

    describe('cold()', () => {
        it('creates cold observable using TestScheduler when marbles only', () => {
            expect(cold('x---x')).toBeInstanceOf(ColdObservable);
            expect(testScheduler.createColdObservable).toHaveBeenCalledOnce();
            expect(testScheduler.createColdObservable)
                .toHaveBeenCalledWith('x---x', undefined, undefined);
        });

        it('creates cold observable using TestScheduler when marbles and values', () => {
            expect(cold('x---x', { x: 5 })).toBeInstanceOf(ColdObservable);
            expect(testScheduler.createColdObservable).toHaveBeenCalledOnce();
            expect(testScheduler.createColdObservable)
                .toHaveBeenCalledWith('x---x', { x: 5 }, undefined);
        });

        it('creates cold observable using TestScheduler when error', () => {
            const error = new Error('error');

            expect(cold('x---#', { x: 5 }, error)).toBeInstanceOf(ColdObservable);
            expect(testScheduler.createColdObservable).toHaveBeenCalledOnce();
            expect(testScheduler.createColdObservable)
                .toHaveBeenCalledWith('x---#', { x: 5 }, error);
        });

        it('trims spaces from marbles', () => {
            cold('  x---x ');

            expect(testScheduler.createColdObservable)
                .toHaveBeenCalledWith('x---x', undefined, undefined);
        });
    });

    describe('hot()', () => {
        it('creates hot observable using TestScheduler when marbles only', () => {
            expect(hot('x---x')).toBeInstanceOf(HotObservable);
            expect(testScheduler.createHotObservable).toHaveBeenCalledOnce();
            expect(testScheduler.createHotObservable)
                .toHaveBeenCalledWith('x---x', undefined, undefined);
        });

        it('creates hot observable using TestScheduler when marbles and values', () => {
            expect(hot('x---x', { x: 5 })).toBeInstanceOf(HotObservable);
            expect(testScheduler.createHotObservable).toHaveBeenCalledOnce();
            expect(testScheduler.createHotObservable)
                .toHaveBeenCalledWith('x---x', { x: 5 }, undefined);
        });

        it('creates hot observable using TestScheduler when error', () => {
            const error = new Error('error');

            expect(hot('x---#', { x: 5 }, error)).toBeInstanceOf(HotObservable);
            expect(testScheduler.createHotObservable).toHaveBeenCalledOnce();
            expect(testScheduler.createHotObservable)
                .toHaveBeenCalledWith('x---#', { x: 5 }, error);
        });

        it('trims spaces from marbles', () => {
            hot('  x---x ');

            expect(testScheduler.createHotObservable)
                .toHaveBeenCalledWith('x---x', undefined, undefined);
        });
    });

    describe('time()', () => {
        it('converts unsubscribe marker to milliseconds using TestScheduler', () => {
            expect(time('----|')).toBe(40);
            expect(testScheduler.createTime).toHaveBeenCalledOnce();
            expect(testScheduler.createTime).toHaveBeenCalledWith('----|');
        });

        it('trims spaces from marbles', () => {
            time('  ----| ');

            expect(testScheduler.createTime).toHaveBeenCalledWith('----|');
        });
    });

    describe('schedule()', () => {
        it('schedules work using TestScheduler', () => {
            const work = () => {
            };

            expect(schedule(work, 120)).toBeInstanceOf(Subscription);
            expect(testScheduler.schedule).toHaveBeenCalledOnce();
            expect(testScheduler.schedule).toHaveBeenCalledWith(work, 120);
        });
    });

    afterAll(() => vi.restoreAllMocks());
});
