import { describe, expect, it } from 'vitest';

import type { TimelineEvent } from '@ilp/lesson-schema';
import { advanceTimeline, resetTimeline } from './timeline';

const events: TimelineEvent[] = [
  { id: 'quiz-90', atSec: 90, action: 'openQuiz', targetId: 'quiz-1', pause: true },
  { id: 'practice-180', atSec: 180, action: 'openPractice', targetId: 'practice-1', pause: true },
  {
    id: 'repeat-240',
    atSec: 240,
    action: 'openResource',
    targetId: 'resource-1',
    pause: false,
    repeatable: true,
  },
];

describe('timeline crossing', () => {
  it('fires events crossed by ordinary playback in order', () => {
    const transition = advanceTimeline(events, resetTimeline(), 200);
    expect(transition.fired.map(({ id }) => id)).toEqual(['quiz-90', 'practice-180']);
    expect(transition.state.currentTime).toBe(200);
  });

  it('fires events crossed by a forward seek without using a fuzzy time window', () => {
    const transition = advanceTimeline(events, { ...resetTimeline(), currentTime: 20 }, 190);
    expect(transition.fired.map(({ id }) => id)).toEqual(['quiz-90', 'practice-180']);
  });

  it('does not duplicate non-repeatable events after repeated updates or backward seek', () => {
    const first = advanceTimeline(events, resetTimeline(), 100);
    const repeated = advanceTimeline(events, first.state, 100);
    const backward = advanceTimeline(events, first.state, 20);
    const forwardAgain = advanceTimeline(events, backward.state, 100);

    expect(repeated.fired).toHaveLength(0);
    expect(backward.fired).toHaveLength(0);
    expect(forwardAgain.fired).toHaveLength(0);
  });

  it('allows explicitly repeatable events after a backward seek', () => {
    const first = advanceTimeline(events, resetTimeline(), 250);
    const backward = advanceTimeline(events, first.state, 100);
    const forwardAgain = advanceTimeline(events, backward.state, 250);

    expect(forwardAgain.fired.map(({ id }) => id)).toEqual(['repeat-240']);
  });
});
