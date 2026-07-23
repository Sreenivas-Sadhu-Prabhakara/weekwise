# weekwise

**Pregnancy due date calculator with dated week-by-week scan windows & ANC visit schedule — from LMP or EDD.**

Enter the first day of your last period (LMP) or the due date your dating scan gave you (EDD).
weekwise turns the *published* prenatal schedule — dating/NT and anomaly scan windows, ANC visits,
Td doses, IFA/calcium starts — into **your own calendar dates**, tickable and printable, with every
row cited to MoHFW (India) or the NHS (England) and a verified-on date shown.

Live: **https://sreenivas-sadhu-prabhakara.github.io/weekwise/**

## Why

Expecting parents do week-arithmetic off a wall poster or ad-choked due-date pages. Clinic front
desks want a clean dated sheet. weekwise does one job: date-in → dated, cited schedule out — and the
record never leaves your browser.

## Features

- **LMP ⇄ EDD** — either derives the other via the 280-day rule, with the formula shown.
  Entering a dating-scan EDD directly *is* the override path: scan dating overrides LMP dating.
- **Today card** — gestational age as weeks+days (29+2 style), trimester, days to EDD, and the
  cited fact that only 4.4% of babies come on their due date.
- **Two tracks, never blended** — MoHFW · India (default) and NHS · England, each separately cited,
  with an always-visible edition + verified-on trust bar.
- **Dated timeline** — every milestone window computed from your LMP with month-end-clamped,
  leap-aware date arithmetic; status chips *upcoming / open now / passed / done* (never colour-only).
- **Tick-to-done** with an optional done-on date, saved in localStorage only. Passed-unticked
  windows surface in a "discuss with your provider" strip — never a replan.
- **A4 print sheet** — optional name (local only), EDD, dated rows with checkboxes, citations and
  the disclaimer — the carry-to-clinic handoff.
- **The 40-bead week strand** — one bead per week; your current week is the single blush bead.
- **JSON backup / restore / erase-all**, keyboard operable, light + dark, works fully offline.

## Quickstart

No build, no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# → http://localhost:8000/
```

Run the self-tests (Node 20+):

```sh
node --test
```

The tests re-derive the date engine (280-day EDD both leap and non-leap, the Naegele month-form
divergence, GA arithmetic, FASP window dates, the 42+0 post-term boundary) and assert the corpus
invariants (row cap, dual tracks, citations, window sanity).

## Privacy — enforced, not promised

The page ships a Content-Security-Policy of `default-src 'self'; connect-src 'none'`:
**the browser itself blocks any network send.** No accounts, no analytics, no cloud, no service
worker. Your dates, ticks and name live only in this browser's localStorage; clearing site data
erases them. Print/JSON export is the only way data leaves — by your hand.

## Corpus & sources

~26 rows + 5 cited constants in `data/timeline.js`, transcribed verbatim from staged source
documents (see `sources/CITATIONS.md`) and read back line-by-line against them on **2026-07-23**:

- MoHFW, *Guidelines for Antenatal Care and Skilled Attendance at Birth by ANMs/LHVs/SNs* (April 2010) — 4-visit ANC schedule, TT/Td guidance, IFA.
- NHM, *National Immunization Schedule* — the Td-1 / Td-2 / Td-Booster rows as printed.
- MoHFW, *National Guidelines for Calcium Supplementation During Pregnancy and Lactation* (2014).
- NHM PMSMA page — fixed-day ANC on the 9th of every month.
- NHS, *Your antenatal appointments* — booking + appointment weeks (16, 25, 28, 31, 34, 36, 38, 40, 41).
- GOV.UK, *NHS Fetal Anomaly Screening Programme handbook* (+ FASP ultrasound handbook) — combined screening 11+2–14+1, anomaly scan 18+0–20+6.
- NHS vaccination pages — whooping cough (16–32 weeks), RSV (from 28 weeks), flu (seasonal).
- Royal Berkshire NHS FT leaflet (May 2026) — the 280-day Naegele rule and the 4.4% due-date fact.

Notes kept honest: the MoHFW guideline publishes **no ultrasound window**, so the app ships no
MoHFW USG row rather than inventing one. NICE NG201 could not be fetched directly (HTTP 403);
appointment weeks are cited to the NHS page instead. Td-2 and Td-Booster are dated from your
actual Td-1 dose, not from LMP — so they are honestly shown dateless.

## Disclaimer

**Informational only — not medical advice.** Your obstetrician/midwife overrides this chart.
weekwise shows a dated snapshot of published MoHFW and NHS schedules (verified 2026-07-23) and
gives no interpretation beyond the cited windows. Guidelines get revised — confirm current advice
at your clinic. Routine singleton pregnancies only; multiple, IVF and high-risk pregnancies follow
different plans this app does not model. An EDD is an estimate; the app never predicts labour.
Missed windows show as "passed" — replanning is the clinician's job. The hospital record / MCP
card remains the record of truth.

Provided "as is", without warranty of any kind — see [LICENSE](LICENSE) (MIT).

© 2026 Sreenivas Sadhu Prabhakara
