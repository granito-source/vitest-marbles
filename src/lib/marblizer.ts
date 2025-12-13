import { SubscriptionLog } from './types';

const frameStep = 10;

enum MarblesGlossary {
    TimeFrame = '-',
    Subscription = '^',
    Unsubscription = '!'
}

export function marblize(logs: SubscriptionLog[]): string[] {
    return logs.map(log => marblizeLogEntry(log.subscribedFrame / frameStep,
        MarblesGlossary.Subscription) +
            marblizeLogEntry((log.unsubscribedFrame - log.subscribedFrame) /
                frameStep - 1, MarblesGlossary.Unsubscription)
    );
}

function marblizeLogEntry(logPoint: number, symbol: string): string {
    return logPoint !== Infinity ?
        MarblesGlossary.TimeFrame.repeat(logPoint) + symbol : '';
}
