import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { mission18VisualStates } from './mission18Visual.testSupport.js';
import { checkpointReport } from './checkpoint.js';
import type * as Ui from './CheckpointStep.js';
let ui: typeof Ui;
beforeAll(async () => {
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {}, removeItem: () => {} });
  ui = await import('./CheckpointStep.js');
  (await import('../../shared/i18n/strings.js')).setUiLangDict('en');
});
describe('Mission 18 presentation without changing the checkpoint engine', () => {
  for (const lang of ['en', 'es', 'fr'] as const) it(`${lang}: concealment, help, four scenes, quiet support and five report rows`, () => {
    const { plan, states } = mission18VisualStates(lang);
    const render = (name: keyof typeof states) => renderToStaticMarkup(createElement(ui.CheckpointView, { plan, state: states[name], onChange: () => {}, onDone: () => {} }));
    const start = render('scan-start');
    expect(start).toContain('Try first');
    expect(start).not.toContain('btn-reply');
    expect(start).not.toContain('scene-note');
    const first = plan.turns[0]!;
    if (first.kind !== 'say') throw new Error('Expected production probe');
    expect(start).not.toContain(first.answer.text);
    expect(render('scan-help')).toContain('data-helped="true"');
    expect(render('scan-help')).toContain('scene-note');
    expect(render('scan-options')).not.toContain('scene-note');
    expect(render('scan-options').match(/btn-reply/g)).toHaveLength(3);
    expect(render('morning').match(/<li /g)).toHaveLength(4);
    expect(render('checkout')).toContain('class="faint small convo-cue"');
    expect(render('later')).toContain('class="faint small convo-cue"');
    expect(render('slow')).toContain('checkpoint-slow');
    expect(render('reveal')).toContain('checkpoint-support-icon');
    expect(render('reveal')).not.toContain('feedback-head bad');
    expect(render('one-fix')).toContain('data-left="1"');
    expect(render('two-fixes')).toContain('data-left="2"');
    expect(render('final-fix')).toContain('data-phase="final-repair"');
    for (const name of ['ready', 'almost', 'review'] as const) {
      const html = render(name);
      expect(checkpointReport(plan, states[name])!.readinessLevel).toBe(name);
      expect(html).toContain(`data-level="${name}"`);
      expect(html.match(/<dt>/g)).toHaveLength(5);
      expect(html).not.toContain('checkpoint-progress');
      expect(html).not.toMatch(/<ol|<ul|<li/);
      expect(html.replace(/<[^>]+>/g, '')).not.toMatch(/\d|%|\bXP\b|score|points/);
    }
  });
  it('zero new images or videos; controls retain 44px and styles are scoped', () => {
    const folder = new URL('../../../public/images/mission18', import.meta.url);
    expect(existsSync(folder) ? readdirSync(folder).length : 0).toBe(0);
    for (const lang of ['en', 'es', 'fr']) expect(existsSync(new URL(`../../../public/videos/${lang}/${lang}_18.mp4`, import.meta.url))).toBe(false);
    expect(readFileSync(new URL('./Bootcamp.tsx', import.meta.url), 'utf8')).toContain('!video && number !== 18');
    const css = readFileSync(new URL('../../app/styles.css', import.meta.url), 'utf8');
    expect(css).toContain('.checkpoint-replay { min-height: 44px; min-width: 44px;');
    expect(css).toContain('.checkpoint[data-checkpoint="everyday-day"] .checkpoint-replay { min-width: 44px; min-height: 44px; }');
    const addition = css.split('/* Mission 18: presentation only.')[1]!;
    for (const line of addition.split('\n').filter(l => l.includes('{') && !l.startsWith('.checkpoint-content'))) expect(line).toContain('[data-checkpoint="everyday-day"]');
  });
});
