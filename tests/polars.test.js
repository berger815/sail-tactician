import { describe, expect, it } from 'vitest';
import { performancePercent, polarSpeed } from '../src/core/polars.js';

const polar = {
  6: { 45: 4, 60: 5 },
  10: { 45: 6, 60: 7 },
};

describe('polars', () => {
  it('interpolates wind speed and angle', () => expect(polarSpeed(polar, 8, 52.5)).toBeCloseTo(5.5));
  it('clamps outside the table', () => expect(polarSpeed(polar, 20, 60)).toBe(7));
  it('reports performance', () => expect(performancePercent(4.5, 5)).toBe(90));
});
