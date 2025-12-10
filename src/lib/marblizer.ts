import { SubscriptionLog, TestMessages } from './types';
import { MarblesGlossary } from './marbles-glossary';
import { NotificationEvent } from './notification-event';
import { NotificationKindChars, ValueLiteral } from './notification-kind';

const frameStep = 10;

export function tryMarblizing(messages: TestMessages): string | TestMessages {
  if (!isMessagesMarblizable(messages))
    return messages;

  const emissions = getNotificationEvents(messages);
  let marbles = '';

  for (let i = 0, prevEndFrame = 0; i < emissions.length; prevEndFrame = emissions[i].end, i++)
    marbles = `${marbles}${
      MarblesGlossary.TimeFrame.repeat(emissions[i].start - prevEndFrame) + emissions[i].marbles
    }`;

  return marbles;
}

export function marblize(logs: SubscriptionLog[]): string[] {
  return logs.map(log =>
    marblizeLogEntry(log.subscribedFrame / frameStep, MarblesGlossary.Subscription) +
      marblizeLogEntry((log.unsubscribedFrame - log.subscribedFrame) / frameStep - 1,
        MarblesGlossary.Unsubscription)
  );
}

function isMessagesMarblizable(messages: TestMessages): boolean {
  return messages.every(({ notification }) => notification.kind === 'C' ||
    notification.kind === 'E' && notification.error === 'error' ||
    notification.kind === 'N' && isCharacter(notification.value));
}

function isCharacter(value: any): boolean {
  return typeof value === 'string' && value.length === 1;
}

function marblizeLogEntry(logPoint: number, symbol: string): string {
  return logPoint !== Infinity ? MarblesGlossary.TimeFrame.repeat(logPoint) + symbol : '';
}

function getNotificationEvents(messages: TestMessages): NotificationEvent[] {
  const framesToEmissions = messages.reduce<{ [frame: number]: NotificationEvent }>((result, message) => {
    if (!result[message.frame])
      result[message.frame] = new NotificationEvent(message.frame / frameStep);

    const event = result[message.frame];

    event.marbles += extractMarble(message);

    return result;
  }, {});

  const events = Object
    .keys(framesToEmissions)
    .map(frame => framesToEmissions[Number(frame)]);

  encloseGroupEvents(events);

  return events;
}

function extractMarble(message: TestMessages[0]): MarblesGlossary | {} {
  let marble = NotificationKindChars[message.notification.kind];

  if (marble === ValueLiteral)
    marble = (message.notification as any).value;

  return marble;
}

function encloseGroupEvents(events: NotificationEvent[]): void {
  events.forEach(event => {
    if (event.marbles.length > 1)
      event.marbles = `${MarblesGlossary.GroupStart}${event.marbles}${MarblesGlossary.GroupEnd}`;
  });
}
