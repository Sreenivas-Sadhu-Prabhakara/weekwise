'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const E = require('../data/engine.js');
const { CONSTANTS, TIMELINE } = require('../data/timeline.js');

/* ---------- EDD: the 280-day rule ---------- */

test('edd: LMP + 280 days, hand-summed day-of-year 281', () => {
  assert.equal(E.edd('2026-01-01'), '2026-10-08');
});

test('edd: leap Feb 29 2028 vs non-leap, same LMP month/day', () => {
  assert.equal(E.edd('2027-06-01'), '2028-03-07'); // crosses leap Feb 2028
  assert.equal(E.edd('2026-06-01'), '2027-03-08'); // crosses non-leap Feb 2027
});

test('naegele month-form diverges by 2 days; 280-day form is canonical', () => {
  assert.equal(E.naegeleMonthForm('2026-03-31'), '2027-01-07');
  assert.equal(E.edd('2026-03-31'), '2027-01-05');
});

test('naegele month-form clamps month-ends', () => {
  // 2026-05-31 → +12mo = 2027-05-31 → −3mo = 2027-02-28 (clamp) → +7d
  assert.equal(E.naegeleMonthForm('2026-05-31'), '2027-03-07');
});

/* ---------- Inversion ---------- */

test('lmpFromEdd is the exact 280-day inversion', () => {
  assert.equal(E.lmpFromEdd('2026-10-08'), '2026-01-01');
});

test('property: lmpFromEdd(edd(x)) === x for 1,000 random valid LMPs', () => {
  // deterministic LCG so failures reproduce byte-identically
  let seed = 42;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 1000; i++) {
    const y = 2000 + Math.floor(rnd() * 60);
    const mo = 1 + Math.floor(rnd() * 12);
    const d = 1 + Math.floor(rnd() * E.daysInMonth(y, mo));
    const iso = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    assert.equal(E.lmpFromEdd(E.edd(iso)), iso, `round-trip failed for ${iso}`);
  }
});

/* ---------- Gestational age ---------- */

test('gaOn: 29+0 at 203 elapsed days, 29+2 at 205', () => {
  const a = E.gaOn('2026-01-01', '2026-07-23');
  assert.equal(a.days, 203);
  assert.equal(a.label, '29+0');
  const b = E.gaOn('2026-01-01', '2026-07-25');
  assert.equal(b.days, 205);
  assert.equal(b.label, '29+2');
});

test('daysToEdd: 8+31+30+8 = 77', () => {
  assert.equal(E.daysToEdd('2026-10-08', '2026-07-23'), 77);
});

/* ---------- Windows ---------- */

test('windowDates: anomaly 18+0–20+6 and combined 11+2–14+1 land on exact dates', () => {
  assert.deepEqual(E.windowDates(126, 146, '2026-01-01'), ['2026-05-07', '2026-05-27']);
  assert.deepEqual(E.windowDates(79, 99, '2026-01-01'), ['2026-03-21', '2026-04-10']);
});

/* ---------- Status engine (today frozen 2026-05-10) ---------- */

test('status: open / passed / upcoming against frozen today', () => {
  const T = '2026-05-10';
  assert.equal(E.statusOf('2026-05-07', '2026-05-27', T, false), 'open');
  assert.equal(E.statusOf('2026-03-21', '2026-04-10', T, false), 'passed');
  // a 28+0 row for LMP 2026-01-01 is due 2026-07-16
  assert.equal(E.addDays('2026-01-01', 196), '2026-07-16');
  assert.equal(E.statusOf('2026-07-16', '2026-07-16', T, false), 'upcoming');
});

test('status: any ticked row is done in all three cases', () => {
  const T = '2026-05-10';
  assert.equal(E.statusOf('2026-05-07', '2026-05-27', T, true), 'done');
  assert.equal(E.statusOf('2026-03-21', '2026-04-10', T, true), 'done');
  assert.equal(E.statusOf('2026-07-16', '2026-07-16', T, true), 'done');
});

/* ---------- Guards: never a fabricated milestone or negative age ---------- */

test('gaOn: LMP in the future returns named error LMP_IN_FUTURE', () => {
  assert.deepEqual(E.gaOn('2026-08-01', '2026-07-23'), { error: 'LMP_IN_FUTURE' });
});

test('POST_TERM fires at exactly day 294 (42+0 onward), not at 293', () => {
  const lmp = '2026-01-01';
  const at293 = E.gaOn(lmp, E.addDays(lmp, 293));
  const at294 = E.gaOn(lmp, E.addDays(lmp, 294));
  assert.equal(at293.postTerm, false);
  assert.equal(at293.label, '41+6');
  assert.equal(at294.postTerm, true);
  assert.equal(at294.label, '42+0');
  assert.equal(E.POST_TERM_DAYS, 294);
  assert.equal(E.trimesterOf(294), null); // trimester map ends at 293
});

test('gaOn rejects malformed dates', () => {
  assert.deepEqual(E.gaOn('2026-02-30', '2026-07-23'), { error: 'BAD_DATE' });
  assert.deepEqual(E.gaOn('not-a-date', '2026-07-23'), { error: 'BAD_DATE' });
});

/* ---------- Trimesters: single-sourced from the corpus ---------- */

test('trimester boundary constants deep-equal the cited corpus rows', () => {
  assert.deepEqual(E.TRIMESTERS, CONSTANTS.TRIMESTERS.value);
  assert.equal(E.TERM_DAYS, CONSTANTS.TERM_DAYS.value);
  assert.equal(E.POST_TERM_DAYS, CONSTANTS.POST_TERM_DAYS.value);
});

test('every GA day 0..293 maps to exactly one trimester; 0→1st, 279→3rd', () => {
  for (let d = 0; d <= 293; d++) {
    const hits = CONSTANTS.TRIMESTERS.value.filter(t => d >= t.startDay && d <= t.endDay);
    assert.equal(hits.length, 1, `day ${d} maps to ${hits.length} trimesters`);
    assert.equal(E.trimesterOf(d).n, hits[0].n);
  }
  assert.equal(E.trimesterOf(0).n, 1);
  assert.equal(E.trimesterOf(279).n, 3);
});

/* ---------- Calendar engine edges ---------- */

test('addDays clamps month-ends and handles leap years', () => {
  assert.equal(E.addDays('2028-02-28', 1), '2028-02-29'); // leap
  assert.equal(E.addDays('2027-02-28', 1), '2027-03-01'); // non-leap
  assert.equal(E.addDays('2026-12-31', 1), '2027-01-01'); // year wrap
  assert.equal(E.addMonths('2026-01-31', 1), '2026-02-28'); // clamp
  assert.equal(E.addMonths('2028-01-31', 1), '2028-02-29'); // leap clamp
});
