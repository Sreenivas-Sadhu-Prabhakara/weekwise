'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const { META, CONSTANTS, TIMELINE } = require('../data/timeline.js');
const E = require('../data/engine.js');

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

test('corpus: total rows <= 45 (the mandated cap)', () => {
  assert.ok(TIMELINE.length <= 45, `${TIMELINE.length} rows`);
  assert.ok(TIMELINE.length >= 20, 'suspiciously thin corpus');
});

test('corpus: every row has a valid track, kind, and non-empty label', () => {
  for (const r of TIMELINE) {
    assert.ok(['MOHFW', 'NHS'].includes(r.track), r.id);
    assert.ok(['scan', 'visit', 'vaccine', 'supplement', 'note'].includes(r.kind), r.id);
    assert.ok(typeof r.label === 'string' && r.label.length > 0, r.id);
  }
});

test('corpus: both tracks present and never blended in a single row', () => {
  const mohfw = TIMELINE.filter(r => r.track === 'MOHFW');
  const nhs = TIMELINE.filter(r => r.track === 'NHS');
  assert.ok(mohfw.length >= 8, `MOHFW has ${mohfw.length}`);
  assert.ok(nhs.length >= 12, `NHS has ${nhs.length}`);
  assert.equal(mohfw.length + nhs.length, TIMELINE.length);
});

test('corpus: every row cites a source with a parseable verified_on', () => {
  for (const r of TIMELINE) {
    assert.ok(typeof r.cite === 'string' && r.cite.length > 10, `${r.id} cite`);
    assert.ok(typeof r.source_url === 'string' && /^https:\/\//.test(r.source_url), `${r.id} url`);
    assert.ok(ISO_RE.test(r.verified_on), `${r.id} verified_on`);
    assert.notEqual(E.toEpochDay(r.verified_on), null, `${r.id} verified_on parses`);
  }
});

test('corpus: ids unique', () => {
  const ids = TIMELINE.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('corpus: windowed rows satisfy 0 <= start <= end <= 294; note-style rows are fully dateless', () => {
  for (const r of TIMELINE) {
    const s = r.startOffsetDays, e = r.endOffsetDays;
    if (s === null || e === null) {
      assert.equal(s, null, r.id);
      assert.equal(e, null, r.id);
    } else {
      assert.ok(Number.isInteger(s) && Number.isInteger(e), r.id);
      assert.ok(s >= 0 && s <= e && e <= 294, `${r.id}: ${s}..${e}`);
    }
  }
});

test('corpus: zero rows mention catch-up or replanning (the clinician replans)', () => {
  for (const r of TIMELINE) {
    const text = `${r.label} ${r.detail}`;
    assert.ok(!/catch[- ]?up|replan/i.test(text), r.id);
  }
});

test('corpus: details stay within 120 chars and only carry sourced qualifiers', () => {
  for (const r of TIMELINE) {
    assert.ok(typeof r.detail === 'string' && r.detail.length > 0, r.id);
    assert.ok(r.detail.length <= 120, `${r.id} detail is ${r.detail.length} chars`);
  }
});

test('corpus: constants carry cites, urls and verified_on too', () => {
  for (const [k, c] of Object.entries(CONSTANTS)) {
    assert.ok(c.cite && c.cite.length > 10, k);
    assert.ok(/^https:\/\//.test(c.source_url), k);
    assert.ok(ISO_RE.test(c.verified_on), k);
  }
  assert.equal(CONSTANTS.TERM_DAYS.value, 280);
  assert.equal(CONSTANTS.POST_TERM_DAYS.value, 294);
  assert.equal(CONSTANTS.DUE_DATE_FACT.value, 4.4);
});

test('corpus: trimester rows tile 0..293 with no gaps or overlaps', () => {
  const t = CONSTANTS.TRIMESTERS.value;
  assert.equal(t.length, 3);
  assert.equal(t[0].startDay, 0);
  assert.equal(t[2].endDay, 293);
  for (let i = 1; i < t.length; i++) {
    assert.equal(t[i].startDay, t[i - 1].endDay + 1, `gap/overlap at trimester ${i + 1}`);
  }
});

test('corpus: META names both editions and a parseable verifiedOn', () => {
  assert.ok(META.mohfwEdition.includes('MoHFW'));
  assert.ok(META.nhsEdition.includes('nhs.uk'));
  assert.ok(ISO_RE.test(META.verifiedOn));
});

test('spot-check: cited windows match their published weeks+days notation', () => {
  const byId = Object.fromEntries(TIMELINE.map(r => [r.id, r]));
  // FASP combined 11+2 to 14+1  →  79..99
  assert.equal(byId['n-combined'].startOffsetDays, 11 * 7 + 2);
  assert.equal(byId['n-combined'].endOffsetDays, 14 * 7 + 1);
  // FASP anomaly 18+0 to 20+6  →  126..146
  assert.equal(byId['n-anomaly'].startOffsetDays, 18 * 7);
  assert.equal(byId['n-anomaly'].endOffsetDays, 20 * 7 + 6);
  // MoHFW ANC visits per the 2010 guideline schedule
  assert.deepEqual([byId['m-anc2'].startOffsetDays, byId['m-anc2'].endOffsetDays], [14 * 7, 26 * 7]);
  assert.deepEqual([byId['m-anc3'].startOffsetDays, byId['m-anc3'].endOffsetDays], [28 * 7, 34 * 7]);
  assert.deepEqual([byId['m-anc4'].startOffsetDays, byId['m-anc4'].endOffsetDays], [36 * 7, 280]);
});
