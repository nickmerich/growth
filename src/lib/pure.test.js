import { describe, it, expect } from 'vitest';
import { slugify, scoringValue, lowerIsBetter, calculateRankings } from './pure.js';

describe('slugify', () => {
  it('lowercases, strips punctuation, and hyphenates spaces', () => {
    expect(slugify('Saturday GRYT 5K!')).toBe('saturday-gryt-5k');
  });
  it('collapses repeated separators', () => {
    expect(slugify('  a   b--c  ')).toBe('a-b-c');
  });
});

describe('lowerIsBetter', () => {
  it('is true for time-based scoring (and the default)', () => {
    expect(lowerIsBetter('Fastest Time')).toBe(true);
    expect(lowerIsBetter()).toBe(true);
  });
  it('is false for higher-is-better methods', () => {
    expect(lowerIsBetter('Most Reps')).toBe(false);
    expect(lowerIsBetter('Longest Distance')).toBe(false);
  });
});

describe('scoringValue', () => {
  it('reads the right metric per method', () => {
    expect(scoringValue({ reps: 40 }, 'Most Reps')).toBe(40);
    expect(scoringValue({ rounds: 7 }, 'Most Rounds')).toBe(7);
    expect(scoringValue({ distance_meters: 1200 }, 'Longest Distance')).toBe(1200);
    expect(scoringValue({ score: 88 }, 'Custom Points')).toBe(88);
    expect(scoringValue({ final_time_seconds: 90 }, 'Fastest Time')).toBe(90);
  });
  it('defaults missing time to Infinity so it sorts last', () => {
    expect(scoringValue({}, 'Fastest Time')).toBe(Infinity);
  });
  it('defaults missing higher-is-better metrics to 0', () => {
    expect(scoringValue({}, 'Most Reps')).toBe(0);
  });
});

describe('calculateRankings', () => {
  it('ranks fastest time ascending', () => {
    const ranked = calculateRankings(
      [
        { id: 'a', final_time_seconds: 305 },
        { id: 'b', final_time_seconds: 290 },
        { id: 'c', final_time_seconds: 320 },
      ],
      'Fastest Time'
    );
    expect(ranked.map((r) => [r.id, r.rank])).toEqual([
      ['b', 1],
      ['a', 2],
      ['c', 3],
    ]);
  });

  it('ranks reps descending', () => {
    const ranked = calculateRankings(
      [
        { id: 'a', reps: 30 },
        { id: 'b', reps: 55 },
        { id: 'c', reps: 41 },
      ],
      'Most Reps'
    );
    expect(ranked.map((r) => r.id)).toEqual(['b', 'c', 'a']);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
  });

  it('places DNF results last with a null rank, regardless of metric', () => {
    const ranked = calculateRankings(
      [
        { id: 'a', final_time_seconds: 300 },
        { id: 'dnf', final_time_seconds: 200, status: 'dnf' },
        { id: 'b', final_time_seconds: 310 },
      ],
      'Fastest Time'
    );
    const dnf = ranked.find((r) => r.id === 'dnf');
    expect(dnf.rank).toBeNull();
    expect(ranked[ranked.length - 1].id).toBe('dnf');
    expect(ranked.filter((r) => r.rank).map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('sorts results missing the metric to the bottom for time events', () => {
    const ranked = calculateRankings(
      [
        { id: 'missing' },
        { id: 'fast', final_time_seconds: 100 },
      ],
      'Fastest Time'
    );
    expect(ranked[0].id).toBe('fast');
    expect(ranked[1].id).toBe('missing');
  });

  it('does not mutate the input array or rows', () => {
    const input = [
      { id: 'a', final_time_seconds: 200 },
      { id: 'b', final_time_seconds: 100 },
    ];
    const snapshot = JSON.parse(JSON.stringify(input));
    calculateRankings(input, 'Fastest Time');
    expect(input).toEqual(snapshot);
  });
});
