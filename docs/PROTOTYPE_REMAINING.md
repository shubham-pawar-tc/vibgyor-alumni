# VIBGYOR Alumni Platform: Prototype Status and Remaining Phases

This file tracks **what is done** and **what is still to build** in the prototype.

---

## 1. Overall status

| Phase | Status | What it covers | Details |
|---|---|---|---|
| 0 – Foundation | ✅ Done | Design, public website, login, roles, sample data | `PROTOTYPE_PHASE_0-1.md` |
| 1 – Safety flows | ✅ Done | Parent consent, safe mentor chat, alumni verification, broadcasts | `PROTOTYPE_PHASE_0-1.md` |
| 2 – Community | ✅ Done | Profiles and privacy, directory, groups, chats, jobs, events, invites | `PROTOTYPE_PHASE_2.md` |
| 3 – Staff tools | ✅ Done | Records, engagement log, duplicates, master lists, moderation, data requests, permissions | `PROTOTYPE_PHASE_3.md` |
| **4 – Data migration** | ⏳ **Pending** | Bring the old portal's data across safely | Section 2 below |
| **5 – Future releases preview** | ⏳ **Pending (optional)** | Preview screens for Release 2 and Release 3 | Section 3 below |

**2 phases remain:** Phase 4 is Release 1 work. Phase 5 is optional.

---

## 2. Phase 4: Data migration (pending)

**Why it matters:** The RFQ marks migration as **Must** (DM-1 to DM-7). VIBGYOR already has thousands of alumni records on the current platform. Vendors must show those records can come across clean, without duplicates, and without anyone needing to sign up again.

### What will be built

| # | Screen | In simple words | RFQ |
|---|---|---|---|
| 1 | **Upload** | Staff upload the Excel/CSV export from the old portal | DM-1, L2 |
| 2 | **Field mapping** | Match the old columns ("Pass Out Yr", "Mob No") to the new fields (batch, mobile). Shown for sign-off before import. | DM-2 |
| 3 | **Clean-up preview** | Before anything is saved, show: spellings fixed with master lists, batch years standardised, duplicates found, bad rows | DM-3, L4, L5 |
| 4 | **Trial run** | Import into a "staging" copy first, without touching live data | DM-4 |
| 5 | **Reconciliation report** | Counts by data type and campus: received, imported, merged, rejected (each with the reason). Downloadable. | DM-4 |
| 6 | **Status preserved** | Verified people stay verified and can "claim" their profile instead of signing up again | DM-5, A1 |
| 7 | **Cut-over checklist** | Data freeze, final run, rollback plan, parallel-run period: a simple checklist with dates | DM-7 |

### The flow

```
Old portal Excel
      │
      ▼
1. Upload ──► 2. Map columns ──► 3. Clean-up preview ──► 4. Trial import (staging)
                 (sign-off)          • master lists fix spellings      │
                                     • duplicates flagged / merged      ▼
                                     • bad rows listed with reasons   5. Reconciliation report
                                                                         received / imported /
                                                                         merged / rejected
                                                                          │
                                                                          ▼
                                                                   6. Go live → alumni
                                                                      "claim" their profile
```

### Reuses from earlier phases
- **Phase 3 master lists** fix spellings during import.
- **Phase 3 duplicate finder** catches people who are in the file twice, or already on the platform.
- **Phase 1 "Claim my profile"** lets migrated alumni take over their record.

### Not in the prototype (real project only)
- Migrating media files (videos, images, resumes) (DM-6): shown as a checklist item only.
- Live connection to the school ERP (INT-1, L8): simulated with a sample file.

---

## 3. Phase 5: Future releases preview (pending, optional)

**Why it matters:** These are **not in Release 1**, but clickable previews help VIBGYOR see the full roadmap. Every screen will be clearly labelled **"Release 2"** or **"Release 3"**.

### Release 2 previews

| Screen | In simple words | RFQ |
|---|---|---|
| **Mentor session booking** | A Class 11–12 student requests a 30-minute session, the mentor accepts, the platform schedules it, and the campus can see it | E2, INT-9, CS-8 |
| **VAA Academy video library** | Guidance videos by alumni, sorted by course and country | E3 |
| **Digital alumni ID card** | Card with a QR code for campus entry and discounts | B18 |
| **City chapters and news feed** | Groups by city (e.g. "Bengaluru chapter") and a moderated feed | C5, C6 |
| **Google / LinkedIn login** | Sign in with Google or LinkedIn | A4, INT-7 |

### Release 3 previews

| Screen | In simple words | RFQ |
|---|---|---|
| **Donations** | Give to a cause, get an 80G tax receipt, yearly donor statement | H1, H2, INT-10 |
| **Membership fees** | Pay alumni association dues | H5 |
| **Merchandise store** | Catalogue, sizes, cart, checkout | H6 |
| **Document requests** | Request a bonafide certificate, LOR, marksheet or transcript, and track it | I1, I5 |
| **MyCareerZ catalogue** | Browse and enrol in assessments, SAT/AP prep, counselling | F1, F2, F4 |
| **Finance dashboard** | Donations, store and membership reports | M5 |

**Payments:** all payment screens will be **demo only**. No real payment gateway, card numbers or money.

---

## 4. Other items not planned yet

These are **Should** or **Could** items in the RFQ that no phase covers yet. They can be added if VIBGYOR wants them:

| Item | RFQ |
|---|---|
| Follow / connect with alumni | C2 |
| Suggested alumni ("people you may know") | C3 |
| Engagement scoring | K2 |
| Saved segments / watchlists | K3 |
| Retention settings per data type | CS-12 |
| CMS for public and campus pages | L7 |
| Surveys and polls | D10 |
| Wall of Fame | C8 |

---

## 5. Open questions for VIBGYOR (from all phases)

| Question | Prototype assumption | Raised in |
|---|---|---|
| How do students log in (school email, admission number + parent OTP, or activation code)? | School email | Phase 1 |
| Consent notice wording | Draft text, v1.0 | Phase 1 |
| Deadline for data requests | 30 days | Phase 3 |
| Moderation response target | 24 hours | Phase 3 |
| Grievance officer name | Not named yet | Phase 3 |
| Default permissions per staff role | Sensible defaults | Phase 3 |
| Old portal export format and fields (needed for Phase 4) | Sample Excel | Phase 4 |

Add these to the **Open Questions & Gaps** sheet in the Track B workbook.
