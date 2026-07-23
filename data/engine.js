/* ============================================================
   weekwise — date engine. Pure ISO-string calendar arithmetic
   (UTC epoch-day math: no timezones, no DST, no Date drift).
   All clinical constants are IMPORTED from data/timeline.js —
   never re-typed here. Works in the browser (globals) and Node.
   ============================================================ */
(function () {
  const src = (typeof module !== 'undefined')
    ? require('./timeline.js')
    : globalThis.WEEKWISE_DATA;

  const C = src.CONSTANTS;
  const TERM_DAYS = C.TERM_DAYS.value;           // 280
  const POST_TERM_DAYS = C.POST_TERM_DAYS.value; // 294 (42+0)
  const TRIMESTERS = C.TRIMESTERS.value;

  const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  const MS_DAY = 86400000;

  function parseISO(iso) {
    const m = ISO_RE.exec(String(iso));
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
    return { y, mo, d };
  }

  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

  function daysInMonth(y, mo) {
    return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
  }

  function toEpochDay(iso) {
    const p = parseISO(iso);
    if (!p) return null;
    return Math.round(Date.UTC(p.y, p.mo - 1, p.d) / MS_DAY);
  }

  function fromEpochDay(n) {
    const dt = new Date(n * MS_DAY);
    const y = dt.getUTCFullYear();
    const mo = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${mo}-${d}`;
  }

  function addDays(iso, n) {
    const e = toEpochDay(iso);
    return e === null ? null : fromEpochDay(e + n);
  }

  function addWeeks(iso, w) { return addDays(iso, w * 7); }

  /* Add months with month-end clamping (e.g. 2026-01-31 + 1mo = 2026-02-28). */
  function addMonths(iso, n) {
    const p = parseISO(iso);
    if (!p) return null;
    const total = (p.y * 12 + (p.mo - 1)) + n;
    const y = Math.floor(total / 12);
    const mo = (total % 12 + 12) % 12 + 1;
    const yy = (total - (mo - 1)) / 12;
    const d = Math.min(p.d, daysInMonth(yy, mo));
    return `${String(yy).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function diffDays(fromIso, toIso) {
    const a = toEpochDay(fromIso), b = toEpochDay(toIso);
    return (a === null || b === null) ? null : b - a;
  }

  /* ---- Core clinical arithmetic ---- */

  /* EDD = LMP + 280 days (the canonical 280-day form of Naegele's rule). */
  function edd(lmpIso) { return addDays(lmpIso, TERM_DAYS); }

  /* Exact inversion: LMP = EDD − 280 days. */
  function lmpFromEdd(eddIso) { return addDays(eddIso, -TERM_DAYS); }

  /* Month-form of Naegele's rule (+1 year, −3 months, +7 days, clamped).
     EXPLAINER ONLY — it diverges from the canonical 280-day form by up to
     ~2 days depending on the calendar months crossed. */
  function naegeleMonthForm(lmpIso) {
    const plusYear = addMonths(lmpIso, 12);
    const minus3mo = addMonths(plusYear, -3);
    return addDays(minus3mo, 7);
  }

  /* Gestational age on a date. Returns {days, weeks, rem, label, postTerm}
     or {error:'LMP_IN_FUTURE'} / {error:'BAD_DATE'}. Never a negative age,
     never a fabricated milestone. POST_TERM fires at >= 294 days (42+0). */
  function gaOn(lmpIso, todayIso) {
    const d = diffDays(lmpIso, todayIso);
    if (d === null) return { error: 'BAD_DATE' };
    if (d < 0) return { error: 'LMP_IN_FUTURE' };
    const weeks = Math.floor(d / 7), rem = d % 7;
    return { days: d, weeks, rem, label: `${weeks}+${rem}`, postTerm: d >= POST_TERM_DAYS };
  }

  /* Signed days remaining until the EDD (negative = past it). */
  function daysToEdd(eddIso, todayIso) { return diffDays(todayIso, eddIso); }

  /* A milestone window in real calendar dates. */
  function windowDates(startOffsetDays, endOffsetDays, lmpIso) {
    return [addDays(lmpIso, startOffsetDays), addDays(lmpIso, endOffsetDays)];
  }

  /* Status of a dated window against a frozen today. Ticked wins in all cases. */
  function statusOf(startIso, endIso, todayIso, ticked) {
    if (ticked) return 'done';
    const t = toEpochDay(todayIso), s = toEpochDay(startIso), e = toEpochDay(endIso);
    if (t === null || s === null || e === null) return 'unknown';
    if (t < s) return 'upcoming';
    if (t > e) return 'passed';
    return 'open';
  }

  /* Trimester for a GA in days, from the cited corpus rows.
     Valid for days 0..293; returns null at/after 294 (post-term). */
  function trimesterOf(gaDays) {
    if (!Number.isInteger(gaDays) || gaDays < 0 || gaDays >= POST_TERM_DAYS) return null;
    for (const t of TRIMESTERS) {
      if (gaDays >= t.startDay && gaDays <= t.endDay) return t;
    }
    return null;
  }

  const api = {
    parseISO, isLeap, daysInMonth, toEpochDay, fromEpochDay,
    addDays, addWeeks, addMonths, diffDays,
    edd, lmpFromEdd, naegeleMonthForm, gaOn, daysToEdd,
    windowDates, statusOf, trimesterOf,
    TERM_DAYS, POST_TERM_DAYS, TRIMESTERS
  };

  if (typeof module !== 'undefined') module.exports = api;
  else globalThis.ENGINE = api;
})();
