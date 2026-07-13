import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const manifest=JSON.parse(readFileSync(new URL('../manifest.webmanifest',import.meta.url),'utf8'));
const worker=readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');

describe('installable offline app',()=>{
  it('publishes iPhone and web app metadata',()=>{
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('rel="apple-touch-icon"');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toHaveLength(1);
  });

  it('caches the complete local race-day shell',()=>{
    for(const asset of ['./index.html','./src/generated/tactician-core.js','./src/legacy/runtime-state.js','./src/legacy/app-3.js']){
      expect(worker).toContain(`'${asset}'`);
    }
    expect(worker).toContain("event.request.mode==='navigate'");
  });
});
