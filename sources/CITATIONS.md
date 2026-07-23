# weekwise — staged sources & citations

Every corpus row in `data/timeline.js` was transcribed from the documents below on
**2026-07-23** (WebFetch/pdftotext), then **read back line-by-line a second time** against
the extracted source text before ship. No number in the corpus exists without a line in one
of these documents. Where an authority URL could not be fetched, the cross-checked secondary
is named and the confidence stated.

## Staged files (in this directory)

| File | What it is | Used for |
|---|---|---|
| `mohfw-anc-guidelines-anm-lhv-sn.pdf` (+ `mohfw-anc.txt` extract) | MoHFW, *Guidelines for Antenatal Care and Skilled Attendance at Birth by ANMs/LHVs/SNs*, Maternal Health Division, April 2010. Fetched from the NHM Odisha mirror: https://nhmodisha.gov.in/wp-content/uploads/2024/03/Guidelines-for-ANC-and-SAB-by-ANMsLHVsSNs.pdf | 4-visit ANC schedule ("1st visit: Within 12 weeks—preferably as soon as pregnancy is suspected…", "2nd visit: Between 14 and 26 weeks", "3rd visit: Between 28 and 34 weeks", "4th visit: Between 36 weeks and term", p.10); TT dosing text (p.25) incl. "TT-2 or booster dose is to be given before 36 weeks of pregnancy" (Annexure I-A footnote); IFA prophylactic dose ("one tablet of IFA (100 mg elemental iron and 0.5 mg folic acid) every day for at least 100 days, starting after the first trimester, at 14–16 weeks of gestation", p.24). **No ultrasound window is published in this guideline — so the app ships no MoHFW USG row.** |
| `nhm-national-immunization-schedule.pdf` (+ `nis.txt`) | NHM/MoHFW, *National Immunization Schedule (NIS) for Infants, Children and Pregnant Women*. https://nhm.gov.in/New_Updates_2018/NHM_Components/Immunization/report/National_%20Immunization_Schedule.pdf | Td rows exactly as printed: Td-1 "Early in pregnancy"; Td-2 "4 weeks after Td-1"; Td-Booster "If received 2 TT/Td doses in a pregnancy within the last 3 years*". |
| `mohfw-calcium-supplementation-guidelines.pdf` (+ `calcium.txt`) | MoHFW, *National Guidelines for Calcium Supplementation During Pregnancy and Lactation* (2014). Fetched from the NHSRC mirror: https://nhsrcindia.org/sites/default/files/2021-03/Guidelines%20for%20Calcium%20Supplementation%20during%20Pregnancy%20and%20Lactation.pdf (canonical: nhm.gov.in maternal-health guidelines) | "Oral swallowable calcium tablets to be taken twice a day (total 1g calcium/day) starting from 14 weeks of pregnancy up to six months post-partum." |
| `gov-uk-fasp-ultrasound-handbook-2015.pdf` (+ `fasp.txt`) | PHE/NHS, *Fetal Anomaly Screening Programme: ultrasound handbook* (July 2015). https://assets.publishing.service.gov.uk/media/611bc45ae90e07054a62c507/FASP_ultrasound_handbook_July_2015_090715.pdf | "The optimal time to perform the combined test is between 11+2 weeks to 14+1 weeks of gestation, which corresponds to a CRL of 45.0 mm to 84.0 mm." |
| `rbfT-baby-due-dates.pdf` (+ `rbft.txt`) | Royal Berkshire NHS Foundation Trust, *Baby due dates and how it affects my care* (May 2026; review due May 2028). https://www.royalberkshire.nhs.uk/media/r0fcsaml/baby-due-dates-and-how-it-affects-my-care.pdf | "…Naegele's rule that a pregnancy lasts for 280 days (or 40 weeks) taken from the first day of the last period, but assumes a woman has a very regular 28-day cycle…"; "Only 4.4% of babies come on their due date…"; "…a scan is highly accurate at measuring how long a woman has been pregnant and working out her most likely due date." |

## Web pages verified by fetch on 2026-07-23 (quotes recorded in `data/timeline.js`)

- **NHS, "Your antenatal appointments"** — https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/
  First midwife (booking) appointment at **8 to 12 weeks**; "11 to 14 week scan"; "18 to 21 week scan";
  appointments at 16, 25 ("You'll have an appointment at 25 weeks if this is your first baby."), 28,
  31 ("You'll be offered an appointment at 31 weeks if this is your first baby."), 34, 36, 38, 40, 41 weeks.
- **GOV.UK, NHS FASP programme handbook** — https://www.gov.uk/government/publications/fetal-anomaly-screening-programme-handbook
  "This ultrasound scan is offered between 18+0 and 20+6 weeks."
- **NHS, "Whooping cough vaccination in pregnancy"** — https://www.nhs.uk/pregnancy/keeping-well/whooping-cough-vaccination/
  "You usually have the whooping cough vaccine at 20 weeks pregnant, but you can have it from 16 weeks."
  "To give your baby the best protection against whooping cough, you should have the vaccine before 32 weeks of pregnancy."
- **NHS, "RSV vaccine"** — https://www.nhs.uk/vaccinations/rsv-vaccine/
  "You should be offered the RSV vaccine around the time of your 28-week antenatal appointment."
  "Getting vaccinated as soon as possible from 28 weeks will provide the best protection for your baby."
- **NHS, "Vaccinations in pregnancy"** — https://www.nhs.uk/pregnancy/keeping-well/vaccinations/
  "Some vaccines, such as the inactivated seasonal flu vaccine and the whooping cough vaccine, are recommended during pregnancy…"
- **NHS, "Week-by-week guide to pregnancy" (Best Start in Life)** — https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/
  Trimester grouping: 1st trimester weeks 4 to 12; 2nd trimester weeks 13 to 27; 3rd trimester weeks 28 to 41.
- **NHS, "Pregnancy due date calculator"** — https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/
  "Pregnancy normally lasts from 37 weeks to 42 weeks from the first day of your last period." (basis of the 42+0 = 294-day post-term threshold)
- **NHM, PMSMA** — https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=1308&lid=689
  "PMSMA was launched to provide fixed-day assured, comprehensive and quality antenatal care universally to all pregnant women (in 2nd and 3rd trimester) on the 9th of every month."
  (pmsma.mohfw.gov.in itself failed TLS verification at fetch time; the NHM page is the cross-checked source.)

## Fetch failures, honestly recorded

- **NICE NG201** (nice.org.uk) returned **HTTP 403** to automated fetch. The NHS antenatal-appointments
  page publishes the same appointment weeks and is the source cited for those rows. Confidence: high
  (nhs.uk is itself an authority for NHS care), but NG201 wording was not independently verified.
- **pmsma.mohfw.gov.in** failed TLS certificate verification. Cross-checked via the NHM page above.
- The MoHFW ANC guideline and calcium guideline PDFs were fetched from government mirrors
  (NHM Odisha, NHSRC) because the primary nhm.gov.in paths were not directly fetchable; the staged
  PDFs are the official documents (title pages verified: April 2010 / 2014).

## Read-back statement

Second independent pass completed 2026-07-23: every `cite`/`detail`/offset pair in
`data/timeline.js` was re-checked against the extracted text files in this directory
(`mohfw-anc.txt`, `nis.txt`, `calcium.txt`, `fasp.txt`, `rbft.txt`) and the recorded page quotes
above. Rows that could not be verified were **dropped** (e.g. a MoHFW ultrasound window), never
fabricated.
