/* ============================================================
   weekwise — app wiring. No inline handlers (CSP), no network.
   State lives in localStorage under 'weekwise:v1' only.
   ============================================================ */
(function () {
  'use strict';

  const DATA = globalThis.WEEKWISE_DATA;
  const E = globalThis.ENGINE;
  const { META, CONSTANTS, TIMELINE } = DATA;

  const LS_KEY = 'weekwise:v1';

  /* ---------- state ---------- */
  const defaultState = () => ({
    mode: 'lmp',          // 'lmp' | 'edd'
    date: '',             // the entered ISO date (meaning depends on mode)
    track: 'MOHFW',       // 'MOHFW' | 'NHS'
    name: '',
    ticks: {},            // id -> { done: true, doneOn: 'YYYY-MM-DD'|null }
    bannerDismissed: false
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      return defaultState();
    }
  }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /* ---------- helpers ---------- */
  const $ = (id) => document.getElementById(id);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmt(iso) {
    const p = E.parseISO(iso);
    return p ? `${p.d} ${MONTHS[p.mo - 1]} ${p.y}` : '—';
  }

  function derive() {
    if (!state.date || !E.parseISO(state.date)) return null;
    let lmp, edd;
    if (state.mode === 'edd') {
      edd = state.date;
      lmp = E.lmpFromEdd(edd);
    } else {
      lmp = state.date;
      edd = E.edd(lmp);
    }
    return { lmp, edd };
  }

  function gaLabel(days) { return `${Math.floor(days / 7)}+${days % 7}`; }

  /* ---------- strand (40-bead week motif) ---------- */
  function renderStrand(gaDays, track) {
    const svg = $('strand');
    const NS = 'http://www.w3.org/2000/svg';
    svg.textContent = '';
    const W = 1000, x0 = 24, x1 = W - 24, step = (x1 - x0) / 39;
    const yAt = (i) => 34 + 10 * Math.sin((i / 39) * Math.PI); // gentle sag

    const path = document.createElementNS(NS, 'path');
    let d = '';
    for (let i = 0; i < 40; i++) d += (i ? ' L' : 'M') + (x0 + i * step).toFixed(1) + ' ' + yAt(i).toFixed(1);
    path.setAttribute('d', d);
    path.setAttribute('class', 'thread');
    svg.appendChild(path);

    const curWeek = (gaDays === null) ? -1 : Math.min(Math.floor(gaDays / 7), 41);
    const milestoneWeeks = new Set(
      TIMELINE.filter(r => r.track === track && r.startOffsetDays !== null)
        .map(r => Math.floor(r.startOffsetDays / 7))
    );

    for (let i = 0; i < 40; i++) {
      const cx = x0 + i * step, cy = yAt(i);
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', cx.toFixed(1));
      c.setAttribute('cy', cy.toFixed(1));
      c.setAttribute('r', i === curWeek ? 9 : 5.5);
      let cls = 'bead';
      if (curWeek >= 0 && i < curWeek) cls += ' bead--past';
      if (i === curWeek) cls += ' bead--now';
      c.setAttribute('class', cls);
      svg.appendChild(c);

      if (milestoneWeeks.has(i)) {
        const tl = document.createElementNS(NS, 'line');
        tl.setAttribute('x1', cx); tl.setAttribute('x2', cx);
        tl.setAttribute('y1', (cy + 7)); tl.setAttribute('y2', (cy + 14));
        tl.setAttribute('class', 'tag-line');
        svg.appendChild(tl);
        const tg = document.createElementNS(NS, 'rect');
        tg.setAttribute('x', cx - 3); tg.setAttribute('y', cy + 14);
        tg.setAttribute('width', 6); tg.setAttribute('height', 6);
        tg.setAttribute('rx', 1.5);
        tg.setAttribute('class', 'tag');
        svg.appendChild(tg);
      }

      if (i % 4 === 0 || i === 39) {
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', cx); t.setAttribute('y', 78);
        t.setAttribute('text-anchor', 'middle');
        t.textContent = 'w' + i;
        svg.appendChild(t);
      }
    }

    if (curWeek >= 0 && curWeek <= 39) {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x0 + curWeek * step);
      t.setAttribute('y', yAt(curWeek) - 14);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'now-label');
      t.textContent = gaLabel(gaDays);
      svg.appendChild(t);
    }
  }

  /* ---------- today card ---------- */
  function renderToday(dates) {
    const sec = $('today');
    const alertEl = $('today-alert');
    if (!dates) { sec.hidden = true; return; }
    sec.hidden = false;

    const t = todayISO();
    const ga = E.gaOn(dates.lmp, t);

    $('edd-out').textContent = fmt(dates.edd);
    $('edd-sub').textContent = state.mode === 'edd'
      ? 'entered from your dating scan (scan dating overrides LMP dating)'
      : `LMP ${fmt(dates.lmp)} + 280 days`;

    alertEl.hidden = true;

    if (ga.error === 'LMP_IN_FUTURE') {
      $('ga-out').textContent = '—';
      $('ga-sub').textContent = '';
      $('tri-out').textContent = '—';
      $('tri-sub').textContent = '';
      $('dte-out').textContent = '—';
      $('dte-sub').textContent = '';
      alertEl.textContent = 'That LMP is in the future — check the date. No milestones are computed from an impossible date.';
      alertEl.hidden = false;
      return { ga: null };
    }

    $('ga-out').textContent = ga.label;
    $('ga-sub').textContent = `${ga.days} days from LMP`;

    const tri = E.trimesterOf(ga.days);
    $('tri-out').textContent = tri ? tri.label : '—';
    $('tri-sub').textContent = tri ? `days ${tri.startDay}–${tri.endDay} of pregnancy` : '';

    const dte = E.daysToEdd(dates.edd, t);
    $('dte-out').textContent = String(Math.abs(dte));
    $('dte-sub').textContent = dte >= 0 ? 'days to go' : 'days past the EDD';

    $('due-fact').textContent = CONSTANTS.DUE_DATE_FACT.text +
      ' (Royal Berkshire NHS FT leaflet, May 2026.) An EDD is an estimate — this app never predicts labour.';

    if (ga.postTerm) {
      alertEl.textContent = 'You are at 42+0 weeks or beyond (post-term). This chart has no milestones here — ' +
        'you should already be in your clinician’s hands for post-dates care.';
      alertEl.hidden = false;
    }
    return { ga };
  }

  /* ---------- timeline ---------- */
  function rowStatus(row, dates, t) {
    const tick = state.ticks[row.id];
    if (row.startOffsetDays === null) return tick && tick.done ? 'done' : 'dateless';
    if (!dates) return 'unknown';
    const [s, e] = E.windowDates(row.startOffsetDays, row.endOffsetDays, dates.lmp);
    return E.statusOf(s, e, t, !!(tick && tick.done));
  }

  const STATUS_TEXT = {
    upcoming: 'Upcoming', open: 'Open now', passed: 'Passed', done: 'Done',
    dateless: 'Not dated from LMP', unknown: ''
  };

  function renderTimeline(dates) {
    const list = $('timeline-list');
    list.textContent = '';
    const t = todayISO();
    const rows = TIMELINE
      .filter(r => r.track === state.track)
      .slice()
      .sort((a, b) => {
        const sa = a.startOffsetDays === null ? 9999 : a.startOffsetDays;
        const sb = b.startOffsetDays === null ? 9999 : b.startOffsetDays;
        return sa - sb || a.id.localeCompare(b.id);
      });

    for (const row of rows) {
      const st = rowStatus(row, dates, t);
      const li = document.createElement('li');
      li.className = 'trow' + (st === 'done' ? ' trow--done' : st === 'open' ? ' trow--open' : st === 'passed' ? ' trow--passed' : '');

      const top = document.createElement('div');
      top.className = 'trow__top';

      const left = document.createElement('div');
      const label = document.createElement('span');
      label.className = 'trow__label';
      label.textContent = row.label;
      left.appendChild(label);
      left.appendChild(document.createTextNode(' '));
      const kind = document.createElement('span');
      kind.className = 'trow__kind';
      kind.textContent = row.kind;
      left.appendChild(kind);
      top.appendChild(left);

      const chip = document.createElement('span');
      chip.className = 'chip chip--' + (st === 'unknown' ? 'dateless' : st);
      chip.textContent = STATUS_TEXT[st] || 'Enter a date';
      top.appendChild(chip);
      li.appendChild(top);

      const win = document.createElement('p');
      win.className = 'win-dates';
      if (row.startOffsetDays === null) {
        win.textContent = 'No LMP-dated window — see the note below.';
      } else if (dates) {
        const [s, e] = E.windowDates(row.startOffsetDays, row.endOffsetDays, dates.lmp);
        const gaS = gaLabel(row.startOffsetDays), gaE = gaLabel(row.endOffsetDays);
        win.textContent = (s === e) ? `${fmt(s)} ` : `${fmt(s)} – ${fmt(e)} `;
        const note = document.createElement('span');
        note.className = 'ga-note';
        note.textContent = (gaS === gaE) ? `(at ${gaS} weeks)` : `(${gaS} to ${gaE} weeks)`;
        win.appendChild(note);
      } else {
        win.textContent = `Weeks ${gaLabel(row.startOffsetDays)} to ${gaLabel(row.endOffsetDays)} — enter your LMP or EDD to date this.`;
      }
      li.appendChild(win);

      const det = document.createElement('p');
      det.className = 'trow__detail';
      det.textContent = row.detail;
      li.appendChild(det);

      const cite = document.createElement('p');
      cite.className = 'trow__cite';
      const a = document.createElement('a');
      a.href = row.source_url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = row.cite;
      cite.appendChild(a);
      cite.appendChild(document.createTextNode(` · verified ${row.verified_on}`));
      li.appendChild(cite);

      // tick controls
      const tickWrap = document.createElement('div');
      tickWrap.className = 'tick-row';
      const tick = state.ticks[row.id] || { done: false, doneOn: null };

      const cbLabel = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!tick.done;
      cb.setAttribute('aria-label', `Mark "${row.label}" done`);
      cb.addEventListener('change', () => {
        if (cb.checked) state.ticks[row.id] = { done: true, doneOn: state.ticks[row.id]?.doneOn || null };
        else delete state.ticks[row.id];
        save(); render();
      });
      cbLabel.appendChild(cb);
      cbLabel.appendChild(document.createTextNode(' Done'));
      tickWrap.appendChild(cbLabel);

      if (tick.done) {
        const dl = document.createElement('label');
        dl.className = 'done-on-label';
        dl.appendChild(document.createTextNode('done on (optional): '));
        const di = document.createElement('input');
        di.type = 'date';
        di.value = tick.doneOn || '';
        di.addEventListener('change', () => {
          state.ticks[row.id] = { done: true, doneOn: di.value || null };
          save(); render();
        });
        dl.appendChild(di);
        tickWrap.appendChild(dl);
        if (tick.doneOn) {
          const dn = document.createElement('span');
          dn.className = 'done-on-label num';
          dn.textContent = `recorded: ${fmt(tick.doneOn)}`;
          tickWrap.appendChild(dn);
        }
      }
      li.appendChild(tickWrap);
      list.appendChild(li);
    }
  }

  /* ---------- attention strip ---------- */
  function renderAttention(dates) {
    const sec = $('attention-sec');
    const ul = $('attention-list');
    ul.textContent = '';
    if (!dates) { sec.hidden = true; return; }
    const t = todayISO();
    const missed = TIMELINE.filter(r =>
      r.track === state.track && r.startOffsetDays !== null &&
      rowStatus(r, dates, t) === 'passed');
    if (!missed.length) { sec.hidden = true; return; }
    sec.hidden = false;
    for (const r of missed) {
      const [s, e] = E.windowDates(r.startOffsetDays, r.endOffsetDays, dates.lmp);
      const li = document.createElement('li');
      li.textContent = `${r.label} — window ${fmt(s)}${s === e ? '' : ' to ' + fmt(e)} has passed and is not marked done.`;
      ul.appendChild(li);
    }
  }

  /* ---------- trust bar + sources ---------- */
  function renderTrust() {
    const html = (el) => {
      el.textContent = '';
      const mk = (k, v) => {
        const s = document.createElement('span');
        const b = document.createElement('strong');
        b.textContent = k + ': ';
        s.appendChild(b);
        s.appendChild(document.createTextNode(v));
        el.appendChild(s);
      };
      mk('Track', state.track === 'MOHFW' ? 'MoHFW · India' : 'NHS · England');
      mk('Edition', state.track === 'MOHFW' ? META.mohfwEdition : META.nhsEdition);
      mk('Rows verified on', META.verifiedOn);
    };
    html($('trust-bar'));
    html($('trust-bar-2'));
  }

  function renderSources() {
    const box = $('sources-list');
    box.textContent = '';
    const addItem = (label, cite, url, verified, extra) => {
      const div = document.createElement('div');
      div.className = 'source-item';
      const l = document.createElement('p'); l.className = 's-label'; l.textContent = label;
      const c = document.createElement('p'); c.className = 's-cite'; c.textContent = cite;
      const m = document.createElement('p'); m.className = 's-meta';
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = url;
      m.appendChild(a);
      m.appendChild(document.createTextNode(` · verified ${verified}${extra ? ' · ' + extra : ''}`));
      div.appendChild(l); div.appendChild(c); div.appendChild(m);
      box.appendChild(div);
    };

    const h1 = document.createElement('h3'); h1.textContent = 'Constants the engine runs on';
    box.appendChild(h1);
    const constLabels = {
      TERM_DAYS: '280-day term (Naegele, canonical form)',
      POST_TERM_DAYS: 'Post-term threshold: 294 days (42+0)',
      DUE_DATE_FACT: 'Only 4.4% of babies come on their due date',
      SCAN_OVERRIDES_LMP: 'Scan dating overrides LMP dating',
      TRIMESTERS: 'Trimester boundaries (NHS week grouping)'
    };
    for (const [k, c] of Object.entries(CONSTANTS)) {
      addItem(constLabels[k] || k, c.cite, c.source_url, c.verified_on);
    }

    for (const track of ['MOHFW', 'NHS']) {
      const h = document.createElement('h3');
      h.style.marginTop = '22px';
      h.textContent = track === 'MOHFW' ? 'MoHFW · India rows' : 'NHS · England rows';
      box.appendChild(h);
      for (const r of TIMELINE.filter(x => x.track === track)) {
        addItem(`${r.label} (${r.kind})`, r.cite, r.source_url, r.verified_on,
          r.startOffsetDays === null ? 'dateless row' : `offsets ${r.startOffsetDays}–${r.endOffsetDays} days from LMP`);
      }
    }
  }

  /* ---------- print head ---------- */
  function renderPrintHead(dates) {
    const el = $('print-head');
    const parts = [];
    if (state.name) parts.push(`Name: ${state.name}`);
    if (dates) parts.push(`EDD: ${fmt(dates.edd)} (${state.mode === 'edd' ? 'scan-dated' : 'LMP + 280 days'})`);
    parts.push(`Track: ${state.track === 'MOHFW' ? 'MoHFW · India' : 'NHS · England'}`);
    parts.push(`Printed: ${fmt(todayISO())}`);
    parts.push(`Rows verified: ${META.verifiedOn}`);
    el.textContent = parts.join('  ·  ');
  }

  /* ---------- master render ---------- */
  function render() {
    const dates = derive();
    const t = todayISO();
    let gaDays = null;
    if (dates) {
      const ga = E.gaOn(dates.lmp, t);
      if (!ga.error) gaDays = ga.days;
    }
    renderStrand(gaDays, state.track);
    renderToday(dates);
    renderAttention(dates);
    renderTimeline(dates);
    renderTrust();
    renderPrintHead(dates);
    $('strand-caption').textContent = gaDays === null
      ? 'The 40-bead strand — one bead per week of pregnancy. Enter a date below to light your current week.'
      : `The 40-bead strand — you are at ${gaLabel(gaDays)} weeks; blush tags mark ${state.track === 'MOHFW' ? 'MoHFW' : 'NHS'} milestone weeks.`;
  }

  /* ---------- wiring ---------- */
  function wire() {
    // banner
    const banner = $('banner');
    banner.hidden = !!state.bannerDismissed;
    $('banner-dismiss').addEventListener('click', () => {
      state.bannerDismissed = true; save();
      banner.hidden = true;
    });

    // mode radios
    $('mode-lmp').checked = state.mode === 'lmp';
    $('mode-edd').checked = state.mode === 'edd';
    const dateLabel = $('date-label');
    const applyModeLabel = () => {
      dateLabel.textContent = state.mode === 'edd'
        ? 'Your due date from the dating scan (EDD)'
        : 'First day of your last period (LMP)';
    };
    applyModeLabel();
    for (const id of ['mode-lmp', 'mode-edd']) {
      $(id).addEventListener('change', () => {
        const next = $('mode-edd').checked ? 'edd' : 'lmp';
        if (next !== state.mode) {
          // keep the same pregnancy: convert the stored date across modes
          const dates = derive();
          if (dates) state.date = next === 'edd' ? dates.edd : dates.lmp;
          state.mode = next;
          $('date-input').value = state.date;
          save();
        }
        applyModeLabel(); render();
      });
    }

    // date input
    const di = $('date-input');
    di.value = state.date;
    di.addEventListener('change', () => { state.date = di.value; save(); render(); });

    // track toggle
    const bM = $('track-mohfw'), bN = $('track-nhs');
    const applyTrack = () => {
      bM.setAttribute('aria-pressed', String(state.track === 'MOHFW'));
      bN.setAttribute('aria-pressed', String(state.track === 'NHS'));
    };
    applyTrack();
    bM.addEventListener('click', () => { state.track = 'MOHFW'; save(); applyTrack(); render(); });
    bN.addEventListener('click', () => { state.track = 'NHS'; save(); applyTrack(); render(); });

    // name
    const ni = $('name-input');
    ni.value = state.name;
    ni.addEventListener('input', () => { state.name = ni.value; save(); renderPrintHead(derive()); });

    // print
    $('print-btn').addEventListener('click', () => window.print());

    // backup / restore / erase
    $('backup-btn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ app: 'weekwise', version: 1, exportedOn: todayISO(), state }, null, 2)],
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekwise-backup-${todayISO()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      $('data-msg').textContent = 'Backup downloaded — it contains only what this browser stores.';
    });

    $('restore-input').addEventListener('change', (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (!parsed || parsed.app !== 'weekwise' || !parsed.state) throw new Error('not a weekwise backup');
          state = Object.assign(defaultState(), parsed.state);
          save();
          location.reload();
        } catch (e) {
          $('data-msg').textContent = 'That file is not a weekwise backup — nothing was changed.';
        }
      };
      reader.readAsText(file);
    });

    $('erase-btn').addEventListener('click', () => {
      if (confirm('Erase all weekwise data from this browser? This cannot be undone (the hospital record / MCP card remains the record of truth).')) {
        localStorage.removeItem(LS_KEY);
        state = defaultState();
        location.reload();
      }
    });

    $('foot-verified').textContent = META.verifiedOn;
  }

  wire();
  renderSources(); // static, cited list — rendered once
  render();
})();
