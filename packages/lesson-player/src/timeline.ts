import type { TimelineEvent } from '@ilp/lesson-schema';

export interface TimelineState {
  currentTime: number;
  triggeredEventIds: ReadonlySet<string>;
}

export interface TimelineTransition {
  state: TimelineState;
  fired: TimelineEvent[];
}

/**
 * Applies a media time update. Events fire only while moving forward across
 * (previousTime, nextTime], so repeated timeupdate events and backward seeks
 * cannot duplicate a non-repeatable checkpoint.
 */
export function advanceTimeline(
  events: readonly TimelineEvent[],
  previous: TimelineState,
  nextTime: number,
): TimelineTransition {
  const next = Number.isFinite(nextTime) && nextTime >= 0 ? nextTime : previous.currentTime;
  if (next <= previous.currentTime) {
    return { state: { ...previous, currentTime: next }, fired: [] };
  }

  const triggered = new Set(previous.triggeredEventIds);
  const fired = events
    .filter((event) => event.atSec > previous.currentTime && event.atSec <= next)
    .filter((event) => event.repeatable || !triggered.has(event.id))
    .sort((left, right) => left.atSec - right.atSec);

  fired.forEach((event) => {
    if (!event.repeatable) triggered.add(event.id);
  });
  return {
    state: { currentTime: next, triggeredEventIds: triggered },
    fired,
  };
}

export function resetTimeline(): TimelineState {
  return { currentTime: 0, triggeredEventIds: new Set<string>() };
}
