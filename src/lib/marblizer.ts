import { SubscriptionLog, TestMessages } from './types';
import { MarblesGlossary } from './marbles-glossary';
import { NotificationEvent } from './notification-event';
import { NotificationKindChars, ValueLiteral } from './notification-kind';

const frameStep = 10;

export class Marblizer {
  public static marblize(messages: TestMessages): string {
    const emissions = Marblizer.getNotificationEvents(messages);
    let marbles = '';

    for (let i = 0, prevEndFrame = 0; i < emissions.length; prevEndFrame = emissions[i].end, i++)
      marbles = `${marbles}${
        MarblesGlossary.TimeFrame.repeat(emissions[i].start - prevEndFrame) + emissions[i].marbles
      }`;

    return marbles;
  }

  public static marblizeSubscriptions(logs: SubscriptionLog[]): string[] {
    return logs.map(log =>
      this.marblizeLogEntry(log.subscribedFrame / frameStep, MarblesGlossary.Subscription) +
        this.marblizeLogEntry((log.unsubscribedFrame - log.subscribedFrame) / frameStep - 1,
          MarblesGlossary.Unsubscription)
    );
  }

  private static marblizeLogEntry(logPoint: number, symbol: string): string {
    return logPoint !== Infinity ? MarblesGlossary.TimeFrame.repeat(logPoint) + symbol : '';
  }

  private static getNotificationEvents(messages: TestMessages): NotificationEvent[] {
    const framesToEmissions = messages.reduce<{ [frame: number]: NotificationEvent }>((result, message) => {
      if (!result[message.frame])
        result[message.frame] = new NotificationEvent(message.frame / frameStep);

      const event = result[message.frame];

      event.marbles += Marblizer.extractMarble(message);

      return result;
    }, {});

    const events = Object
      .keys(framesToEmissions)
      .map(frame => framesToEmissions[Number(frame)]);

    Marblizer.encloseGroupEvents(events);

    return events;
  }

  private static extractMarble(message: TestMessages[0]): MarblesGlossary | {} {
    let marble = NotificationKindChars[message.notification.kind];

    if (marble === ValueLiteral)
      marble = (message.notification as any).value;

    return marble;
  }

  private static encloseGroupEvents(events: NotificationEvent[]): void {
    events.forEach(event => {
      if (event.marbles.length > 1)
        event.marbles = `${MarblesGlossary.GroupStart}${event.marbles}${MarblesGlossary.GroupEnd}`;
    });
  }
}
