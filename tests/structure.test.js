import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('application shell', () => {
  it('loads extracted assets', () => {
    expect(html).toContain('<link rel="stylesheet" href="./src/styles/legacy.css">');
    expect(html).toContain('<script defer src="./src/generated/tactician-core.js"></script>');
    expect(html).toContain('<script defer src="./src/legacy/app-1.js"></script>');
    expect(html).toContain('<script defer src="./src/legacy/app-2.js"></script>');
    expect(html).toContain('<script defer src="./src/legacy/app-3.js"></script>');
  });

  it('contains no inline style or script blocks', () => {
    expect(html).not.toMatch(/<style(?:\s|>)/i);
    expect(html).not.toMatch(/<script(?![^>]*\bsrc=)/i);
  });

  it('preserves all three product modes', () => {
    expect(html).toContain('id="modeStart"');
    expect(html).toContain('id="modePlan"');
    expect(html).toContain('id="modeRace"');
  });
});
