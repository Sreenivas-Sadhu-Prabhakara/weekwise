/* ============================================================
   weekwise — corpus: pregnancy timeline rows + cited constants.
   Two tracks, NEVER blended: MOHFW (India) and NHS (England).
   Every row transcribed from a staged source (see sources/CITATIONS.md)
   and re-read line-by-line against the source on 2026-07-23.
   Offsets are days from the first day of the LMP (GA day 0).
   A week "N appointment" = while you are N weeks pregnant,
   i.e. GA N+0 .. N+6  →  offsets N*7 .. N*7+6.
   ============================================================ */

const META = {
  mohfwEdition:
    'MoHFW "Guidelines for Antenatal Care and Skilled Attendance at Birth by ANMs/LHVs/SNs" (April 2010) · ' +
    'National Immunization Schedule (NHM) · National Guidelines for Calcium Supplementation (2014) · NHM PMSMA page',
  nhsEdition:
    'nhs.uk "Your antenatal appointments" · GOV.UK NHS FASP programme handbook · ' +
    'nhs.uk vaccination pages · NHS week-by-week guide',
  verifiedOn: '2026-07-23'
};

/* ---- Cited constants the engine imports (single source of truth) ---- */
const CONSTANTS = {
  TERM_DAYS: {
    value: 280,
    cite: 'Royal Berkshire NHS FT, "Baby due dates and how it affects my care" (May 2026): "…Naegele’s rule that a pregnancy lasts for 280 days (or 40 weeks) taken from the first day of the last period, but assumes a woman has a very regular 28-day cycle…"',
    source_url: 'https://www.royalberkshire.nhs.uk/media/r0fcsaml/baby-due-dates-and-how-it-affects-my-care.pdf',
    verified_on: '2026-07-23'
  },
  POST_TERM_DAYS: {
    value: 294, // 42+0 weeks
    cite: 'NHS due date calculator: "Pregnancy normally lasts from 37 weeks to 42 weeks from the first day of your last period." 42 weeks = 294 days; at 42+0 this app stops computing milestones and says so.',
    source_url: 'https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/',
    verified_on: '2026-07-23'
  },
  DUE_DATE_FACT: {
    value: 4.4, // percent
    text: 'Only 4.4% of babies come on their due date — fewer than 1 in 20.',
    cite: 'Royal Berkshire NHS FT, "Baby due dates and how it affects my care" (May 2026): "Only 4.4% of babies come on their due date…" — an EDD is an estimate; this app never predicts labour.',
    source_url: 'https://www.royalberkshire.nhs.uk/media/r0fcsaml/baby-due-dates-and-how-it-affects-my-care.pdf',
    verified_on: '2026-07-23'
  },
  SCAN_OVERRIDES_LMP: {
    value: true,
    cite: 'Royal Berkshire NHS FT (May 2026): "…a scan is highly accurate at measuring how long a woman has been pregnant and working out her most likely due date." Entering a dating-scan EDD directly IS this app’s override path.',
    source_url: 'https://www.royalberkshire.nhs.uk/media/r0fcsaml/baby-due-dates-and-how-it-affects-my-care.pdf',
    verified_on: '2026-07-23'
  },
  TRIMESTERS: {
    // NHS week-by-week guide groups: 1st trimester weeks 4 to 12,
    // 2nd trimester weeks 13 to 27, 3rd trimester weeks 28 to 41.
    // Week N (1-based) = GA days (N-1)*7 .. N*7-1.
    value: [
      { n: 1, label: '1st trimester', startDay: 0,   endDay: 83  },
      { n: 2, label: '2nd trimester', startDay: 84,  endDay: 188 },
      { n: 3, label: '3rd trimester', startDay: 189, endDay: 293 }
    ],
    cite: 'NHS "Week-by-week guide to pregnancy" (Best Start in Life) groups: 1st trimester weeks 4 to 12; 2nd trimester weeks 13 to 27; 3rd trimester weeks 28 to 41.',
    source_url: 'https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/',
    verified_on: '2026-07-23'
  }
};

/* ---- Timeline rows ---- */
const TIMELINE = [
  /* ================= MoHFW (India) ================= */
  {
    id: 'm-anc1', track: 'MOHFW', kind: 'visit',
    label: 'ANC visit 1 — registration + first check-up',
    startOffsetDays: 0, endOffsetDays: 84,
    detail: 'Within 12 weeks — preferably as soon as pregnancy is suspected — for registration and first antenatal check-up.',
    cite: 'MoHFW, Guidelines for Antenatal Care and Skilled Attendance at Birth by ANMs/LHVs/SNs (April 2010), "Suggested schedule for antenatal visits", p.10',
    source_url: 'https://nhmodisha.gov.in/wp-content/uploads/2024/03/Guidelines-for-ANC-and-SAB-by-ANMsLHVsSNs.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'm-anc2', track: 'MOHFW', kind: 'visit',
    label: 'ANC visit 2',
    startOffsetDays: 98, endOffsetDays: 182,
    detail: 'Between 14 and 26 weeks.',
    cite: 'MoHFW ANC/SBA Guidelines (April 2010), "Suggested schedule for antenatal visits", p.10',
    source_url: 'https://nhmodisha.gov.in/wp-content/uploads/2024/03/Guidelines-for-ANC-and-SAB-by-ANMsLHVsSNs.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'm-anc3', track: 'MOHFW', kind: 'visit',
    label: 'ANC visit 3',
    startOffsetDays: 196, endOffsetDays: 238,
    detail: 'Between 28 and 34 weeks. The guideline also advises an MO check-up at the PHC during this visit window.',
    cite: 'MoHFW ANC/SBA Guidelines (April 2010), "Suggested schedule for antenatal visits", p.10',
    source_url: 'https://nhmodisha.gov.in/wp-content/uploads/2024/03/Guidelines-for-ANC-and-SAB-by-ANMsLHVsSNs.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'm-anc4', track: 'MOHFW', kind: 'visit',
    label: 'ANC visit 4',
    startOffsetDays: 252, endOffsetDays: 280,
    detail: 'Between 36 weeks and term.',
    cite: 'MoHFW ANC/SBA Guidelines (April 2010), "Suggested schedule for antenatal visits", p.10',
    source_url: 'https://nhmodisha.gov.in/wp-content/uploads/2024/03/Guidelines-for-ANC-and-SAB-by-ANMsLHVsSNs.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'm-td1', track: 'MOHFW', kind: 'vaccine',
    label: 'Td-1 (tetanus + adult diphtheria)',
    startOffsetDays: 0, endOffsetDays: 280,
    detail: 'NIS: "Early in pregnancy" — first dose as soon as possible, preferably at ANC registration. 0.5 ml IM, upper arm.',
    cite: 'National Immunization Schedule (NIS) for Pregnant Women, "Td-1: Early in pregnancy"; MoHFW ANC/SBA Guidelines (2010), p.25',
    source_url: 'https://nhm.gov.in/New_Updates_2018/NHM_Components/Immunization/report/National_%20Immunization_Schedule.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'm-td2', track: 'MOHFW', kind: 'vaccine',
    label: 'Td-2',
    startOffsetDays: null, endOffsetDays: null,
    detail: '"4 weeks after Td-1" — dated from your actual Td-1 dose, not from LMP. TT-2/booster is to be given before 36 weeks.',
    cite: 'NIS for Pregnant Women, "Td-2: 4 weeks after Td-1"; MoHFW ANC/SBA Guidelines (2010) Annexure I-A footnote: "TT-2 or booster dose is to be given before 36 weeks of pregnancy."',
    source_url: 'https://nhm.gov.in/New_Updates_2018/NHM_Components/Immunization/report/National_%20Immunization_Schedule.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'm-td-booster', track: 'MOHFW', kind: 'vaccine',
    label: 'Td-Booster (instead of Td-1 + Td-2)',
    startOffsetDays: null, endOffsetDays: null,
    detail: '"If received 2 TT/Td doses in a pregnancy within the last 3 years" — one dose, as early as possible in this pregnancy.',
    cite: 'NIS for Pregnant Women, "Td-Booster: If received 2 TT/Td doses in a pregnancy within the last 3 years"',
    source_url: 'https://nhm.gov.in/New_Updates_2018/NHM_Components/Immunization/report/National_%20Immunization_Schedule.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'm-ifa', track: 'MOHFW', kind: 'supplement',
    label: 'Start daily IFA (iron + folic acid)',
    startOffsetDays: 98, endOffsetDays: 112,
    detail: '1 tablet (100 mg elemental iron + 0.5 mg folic acid) daily for at least 100 days, starting at 14–16 weeks.',
    cite: 'MoHFW ANC/SBA Guidelines (April 2010), p.24: "…one tablet of IFA…every day for at least 100 days, starting after the first trimester, at 14–16 weeks of gestation."',
    source_url: 'https://nhmodisha.gov.in/wp-content/uploads/2024/03/Guidelines-for-ANC-and-SAB-by-ANMsLHVsSNs.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'm-calcium', track: 'MOHFW', kind: 'supplement',
    label: 'Daily calcium supplementation',
    startOffsetDays: 98, endOffsetDays: 280,
    detail: 'Two 500 mg tablets a day (1 g/day) from 14 weeks of pregnancy up to six months post-partum; not both together.',
    cite: 'MoHFW, National Guidelines for Calcium Supplementation During Pregnancy and Lactation (2014): "…twice a day (total 1g calcium/day) starting from 14 weeks of pregnancy up to six months post-partum."',
    source_url: 'https://nhm.gov.in/images/pdf/programmes/maternal-health/guidelines/National_Guidelines_for_Calcium_Supplementation_During_Pregnancy_and_Lactation.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'm-pmsma', track: 'MOHFW', kind: 'note',
    label: 'PMSMA fixed-day ANC — 9th of every month',
    startOffsetDays: null, endOffsetDays: null,
    detail: 'Free assured ANC for women in 2nd/3rd trimester at government facilities on the 9th of every month.',
    cite: 'NHM, Pradhan Mantri Surakshit Matritva Abhiyan: "…quality antenatal care universally to all pregnant women (in 2nd and 3rd trimester) on the 9th of every month."',
    source_url: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=1308&lid=689',
    verified_on: '2026-07-23'
  },

  /* ================= NHS (England) ================= */
  {
    id: 'n-booking', track: 'NHS', kind: 'visit',
    label: 'First midwife (booking) appointment',
    startOffsetDays: 56, endOffsetDays: 84,
    detail: 'At 8 to 12 weeks; sometimes called the booking appointment, it can take around 1 hour.',
    cite: 'NHS, "Your antenatal appointments": first midwife appointment at 8 to 12 weeks',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-dating', track: 'NHS', kind: 'scan',
    label: '11 to 14 week scan (dating scan)',
    startOffsetDays: 77, endOffsetDays: 98,
    detail: 'Ultrasound to check when your baby is due, their development, and whether you are having more than one baby.',
    cite: 'NHS, "Your antenatal appointments", "11 to 14 week scan"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-combined', track: 'NHS', kind: 'scan',
    label: 'FASP combined screening (T21 / T18 / T13)',
    startOffsetDays: 79, endOffsetDays: 99,
    detail: 'Optimal window 11+2 to 14+1 weeks, corresponding to a CRL of 45.0–84.0 mm.',
    cite: 'NHS FASP ultrasound handbook: "The optimal time to perform the combined test is between 11+2 weeks to 14+1 weeks of gestation, which corresponds to a CRL of 45.0 mm to 84.0 mm."',
    source_url: 'https://assets.publishing.service.gov.uk/media/611bc45ae90e07054a62c507/FASP_ultrasound_handbook_July_2015_090715.pdf',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-anomaly', track: 'NHS', kind: 'scan',
    label: 'FASP anomaly scan (20-week screening scan)',
    startOffsetDays: 126, endOffsetDays: 146,
    detail: 'Offered between 18+0 and 20+6 weeks; sometimes called the 20-week screening scan.',
    cite: 'GOV.UK, NHS Fetal Anomaly Screening Programme handbook: "This ultrasound scan is offered between 18+0 and 20+6 weeks."',
    source_url: 'https://www.gov.uk/government/publications/fetal-anomaly-screening-programme-handbook',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-16w', track: 'NHS', kind: 'visit',
    label: '16 week appointment',
    startOffsetDays: 112, endOffsetDays: 118,
    detail: 'Midwife appointment — health and wellbeing review.',
    cite: 'NHS, "Your antenatal appointments", "16 week appointment"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-25w', track: 'NHS', kind: 'visit',
    label: '25 week appointment (first baby)',
    startOffsetDays: 175, endOffsetDays: 181,
    detail: '"You’ll have an appointment at 25 weeks if this is your first baby."',
    cite: 'NHS, "Your antenatal appointments", "25 week appointment"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-28w', track: 'NHS', kind: 'visit',
    label: '28 week appointment',
    startOffsetDays: 196, endOffsetDays: 202,
    detail: 'Midwife appointment — health and wellbeing review.',
    cite: 'NHS, "Your antenatal appointments", "28 week appointment"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-31w', track: 'NHS', kind: 'visit',
    label: '31 week appointment (first baby)',
    startOffsetDays: 217, endOffsetDays: 223,
    detail: '"You’ll be offered an appointment at 31 weeks if this is your first baby."',
    cite: 'NHS, "Your antenatal appointments", "31 week appointment"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-34w', track: 'NHS', kind: 'visit',
    label: '34 week appointment',
    startOffsetDays: 238, endOffsetDays: 244,
    detail: 'Midwife appointment — health and wellbeing review.',
    cite: 'NHS, "Your antenatal appointments", "34 week appointment"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-36w', track: 'NHS', kind: 'visit',
    label: '36 week appointment',
    startOffsetDays: 252, endOffsetDays: 258,
    detail: 'Midwife appointment — health and wellbeing review.',
    cite: 'NHS, "Your antenatal appointments", "36 week appointment"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-38w', track: 'NHS', kind: 'visit',
    label: '38 week appointment',
    startOffsetDays: 266, endOffsetDays: 272,
    detail: 'Midwife appointment — health and wellbeing review.',
    cite: 'NHS, "Your antenatal appointments", "38 week appointment"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-40w', track: 'NHS', kind: 'visit',
    label: '40 week appointment',
    startOffsetDays: 280, endOffsetDays: 286,
    detail: 'Midwife appointment — health and wellbeing review.',
    cite: 'NHS, "Your antenatal appointments", "40 week appointment"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-41w', track: 'NHS', kind: 'visit',
    label: '41 week appointment',
    startOffsetDays: 287, endOffsetDays: 293,
    detail: 'Midwife appointment if you have not given birth yet.',
    cite: 'NHS, "Your antenatal appointments", "41 week appointment"',
    source_url: 'https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-pertussis', track: 'NHS', kind: 'vaccine',
    label: 'Whooping cough (pertussis) vaccine',
    startOffsetDays: 112, endOffsetDays: 224,
    detail: 'Usually at 20 weeks, can have it from 16 weeks; best protection for the baby if given before 32 weeks.',
    cite: 'NHS, "Whooping cough vaccination in pregnancy": "You usually have the whooping cough vaccine at 20 weeks pregnant, but you can have it from 16 weeks… you should have the vaccine before 32 weeks."',
    source_url: 'https://www.nhs.uk/pregnancy/keeping-well/whooping-cough-vaccination/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-rsv', track: 'NHS', kind: 'vaccine',
    label: 'RSV vaccine',
    startOffsetDays: 196, endOffsetDays: 280,
    detail: 'Offered around the 28-week appointment; soonest from 28 weeks gives best protection; can be given later.',
    cite: 'NHS, "RSV vaccine": "You should be offered the RSV vaccine around the time of your 28-week antenatal appointment… Getting vaccinated as soon as possible from 28 weeks will provide the best protection…"',
    source_url: 'https://www.nhs.uk/vaccinations/rsv-vaccine/',
    verified_on: '2026-07-23'
  },
  {
    id: 'n-flu', track: 'NHS', kind: 'note',
    label: 'Flu vaccine',
    startOffsetDays: null, endOffsetDays: null,
    detail: 'Inactivated seasonal flu vaccine recommended during pregnancy; timing follows the flu season, not your weeks.',
    cite: 'NHS, "Vaccinations in pregnancy": "Some vaccines, such as the inactivated seasonal flu vaccine and the whooping cough vaccine, are recommended during pregnancy…"',
    source_url: 'https://www.nhs.uk/pregnancy/keeping-well/vaccinations/',
    verified_on: '2026-07-23'
  }
];

if (typeof module !== 'undefined') module.exports = { META, CONSTANTS, TIMELINE };
else globalThis.WEEKWISE_DATA = { META, CONSTANTS, TIMELINE };
