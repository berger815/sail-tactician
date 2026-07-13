import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles/legacy.css',import.meta.url),'utf8');

describe('mobile race-day UI',()=>{
  it('presents the primary flow in sailor order',()=>{
    const prep=html.indexOf("setMode('plan')\">PREP");
    const start=html.indexOf("setMode('start')\">START");
    const race=html.indexOf("setMode('race')\">RACE");
    expect(prep).toBeGreaterThan(0);
    expect(prep).toBeLessThan(start);
    expect(start).toBeLessThan(race);
    expect(html).toContain('1 SET PINS · 2 SET WIND · 3 START TIMER');
  });

  it('accounts for every iPhone safe area',()=>{
    for(const inset of ['safe-area-inset-top','safe-area-inset-right','safe-area-inset-bottom','safe-area-inset-left']){
      expect(css).toContain(inset);
    }
  });

  it('provides mobile touch targets and short-screen fallbacks',()=>{
    expect(css).toContain('min-height:44px');
    expect(css).toContain('@media (max-width:520px)');
    expect(css).toContain('@media (max-height:700px)');
    expect(css).toContain('@media (prefers-reduced-motion:reduce)');
  });
});
