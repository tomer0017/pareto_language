/**
 * Writes the complete Practice + dialogue audit source from the runtime mission content
 * (rendering is pure and test-bound: apps/web/src/features/bootcamp/practiceAudit.ts).
 * Read-only with respect to the curriculum — it changes no mission, sentence, question or id.
 *
 * Run: npm run gen:practice-audit → docs/READY_CORE30_COMPLETE_PRACTICE_AUDIT_SOURCE.md
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { practiceAuditStats, renderPracticeAudit } from '../apps/web/src/features/bootcamp/practiceAudit.js';

const out = fileURLToPath(new URL('../docs/READY_CORE30_COMPLETE_PRACTICE_AUDIT_SOURCE.md', import.meta.url));
const text = renderPracticeAudit();
writeFileSync(out, text);
console.info(`[gen-practice-audit] ${text.split('\n').length} lines → ${out}`);
console.info(JSON.stringify(practiceAuditStats(), null, 2));
