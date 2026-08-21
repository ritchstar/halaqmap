/**
 * عبارات ترحيب قاعة الزواج — ثلاثاً ثلاثاً.
 */
import assert from 'node:assert/strict';
import {
  STORE_WEDDING_WELCOME_SETS,
  STORE_WEDDING_WELCOME_SET_SIZE,
  nextWeddingWelcomeSetIndex,
  normalizeWeddingWelcomeSetIndex,
  weddingWelcomeHeroText,
  weddingWelcomeSetAt,
  weddingWelcomeSetCount,
} from '../src/config/storeWeddingWelcomeSets.ts';

assert.equal(STORE_WEDDING_WELCOME_SET_SIZE, 3);
assert.equal(weddingWelcomeSetCount(), 4);
assert.ok(weddingWelcomeSetCount() >= 2);

for (const set of STORE_WEDDING_WELCOME_SETS) {
  assert.equal(set.lines.length, 3);
  assert.equal(set.lines[0].weight, 'hero');
  assert.equal(set.lines[1].weight, 'support');
  assert.equal(set.lines[2].weight, 'caption');
  for (const line of set.lines) {
    assert.ok(line.textAr.trim().length > 8);
    assert.equal(line.textAr.includes('🌸'), false);
    assert.equal(line.textAr.includes('⚡'), false);
  }
}

assert.equal(normalizeWeddingWelcomeSetIndex(-1), 3);
assert.equal(normalizeWeddingWelcomeSetIndex(4), 0);
assert.equal(nextWeddingWelcomeSetIndex(0), 1);
assert.equal(nextWeddingWelcomeSetIndex(3), 0);
assert.equal(weddingWelcomeSetAt(0).id, 'formal');
assert.equal(weddingWelcomeSetAt(2).id, 'display');
assert.match(weddingWelcomeHeroText(0), /أهلاً ومرحباً بكم/);

const seen = new Set(STORE_WEDDING_WELCOME_SETS.flatMap((set) => set.lines.map((line) => line.id)));
assert.equal(seen.size, 12);

console.log('wedding welcome sets: ok', weddingWelcomeSetCount());
