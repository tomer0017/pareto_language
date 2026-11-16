import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { M19_SLOTS, M19_PROPS } from './practiceTransport.js';
import { missionContent } from './priorLearning.js';
const records = JSON.parse(readFileSync(new URL('../../../../../docs/mission19-artwork.json', import.meta.url), 'utf8')) as {name:string;bytes:number;sha256:string}[];
const baseline = {"en":"c1541cfc6b61c922f2edb2c73b8492cb53de09eb3a76fd8953981e5de3ce1ed2","es":"f09cc6a50360ccc7a5c3bd8d63c7ff3fb7779232784bc203b556bbaa2ec6c7e6","fr":"9c7c04f220c52005c85fff9e2db2ef504144492d395afb77cc760fd145398fd2"};
describe('Mission 19 artwork integration', () => {
  it('exactly seven reviewed, full landscape JPEG assets in the existing slots', () => {
    expect(records).toHaveLength(7);
    expect(readdirSync(new URL('../../../public/images/mission19', import.meta.url)).sort()).toEqual(records.map(r=>`${r.name}.jpg`).sort());
    for(const r of records){
      const data=readFileSync(new URL(`../../../public/images/mission19/${r.name}.jpg`, import.meta.url));
      expect(data.subarray(0,2).toString('hex')).toBe('ffd8');
      expect(data.length).toBe(r.bytes);
      expect(data.length).toBeLessThan(800000);
      expect(createHash('sha256').update(data).digest('hex')).toBe(r.sha256);
      let w=0,h=0;for(let i=2;i<data.length-9;){if([0xc0,0xc1,0xc2].includes(data[i+1]!)){h=data.readUInt16BE(i+5);w=data.readUInt16BE(i+7);break;}i+=2+data.readUInt16BE(i+2);}
      expect(w).toBeGreaterThanOrEqual(1536);expect(w/h).toBeCloseTo(16/9,2);
    }
    for(const [name,slot] of Object.entries({...M19_SLOTS,...M19_PROPS}))expect(slot.image).toBe(`images/mission19/${name}.jpg`);
  });
  for(const lang of ['en','es','fr'] as const)it(`${lang}: every nonvisual byte and video step matches main ad27f40`,()=>{
    const day=missionContent(lang,19);
    const json=JSON.stringify(day,(k,v)=>['image','emoji','situationImage'].includes(k)?undefined:v);
    expect(createHash('sha256').update(json).digest('hex')).toBe(baseline[lang]);
    expect(day.steps.filter(s=>s.kind==='video')).toEqual([{kind:'video',mode:'again'}]);
    expect(day.steps[0]).toHaveProperty('image','images/mission19/desk.jpg');
    expect(day.steps[31]).toHaveProperty('image','images/mission19/ride-complete.jpg');
    for(const s of day.steps)if(s.kind==='visualMatch')for(const t of s.tiles)expect(t.image).toBeUndefined();
  });
});
