# VIBGYOR Alumni Platform: Prototype Phase 3

Phase 2 built the community. Phase 3 builds the **back office**: the tools the alumni office uses to keep data **clean, safe and legal**.

- **Run it:** `cd prototype` → `npm run dev` → http://localhost:3000
- **Start fresh:** click **Reset demo data** (old saved data resets automatically once).
- **Who to log in as:** **Meera Joshi** (one campus), **Sanjay Verma** (all 39 campuses) and **Rahul Menon** (Super Admin). Staff use the 2-factor code (click "Autofill demo code").

---

## 1. What's new at a glance

| # | Feature | In simple words | RFQ |
|---|---|---|---|
| 1 | **Alumni records** | One table of every alumnus: edit, switch off, export | L1, L3, CS-14 |
| 2 | **Engagement log** | Notes of every call, email or meeting with an alumnus, plus Excel upload | K1 |
| 3 | **Duplicates** | Finds people who have two records and merges them | L4, DM-3 |
| 4 | **Master lists** | One correct spelling for each college, course and industry | L5, DM-3 |
| 5 | **Moderation** | Queue of reported posts, jobs and profiles, with a 24-hour timer | L6, CS-7 |
| 6 | **Data requests** | "Send me my data", "correct this", "delete me", complaints, with due dates | A11, CS-11, CS-15 |
| 7 | **Permissions** | Grid of what each staff role is allowed to do | A6 |
| 8 | **Report button** | Members can report any post, job or profile | CS-7 |
| 9 | **My data** | Members and parents download their data or send a request | A11, CS-11 |

The staff menu is now grouped: **Queues**, **People & data**, **Communication**, **Governance**.

| Page | Campus Admin (Meera) | Group office (Sanjay) | Super Admin (Rahul) |
|---|---|---|---|
| Alumni records, Engagement log, Moderation, Data requests | ✅ own campus | ✅ all campuses | ✅ all campuses |
| Duplicates, Master lists | ❌ | ✅ | ✅ |
| Permissions | ❌ | ❌ | ✅ |

---

## 2. The flows

### Flow 12: Keeping alumni records and exporting safely

**Why:** L1 (staff can edit and deactivate records), L3 (every export needs a reason) and CS-14 (privacy choices are respected in exports too).

```
Meera → Alumni records
   │  search, filter by status (Verified / Pending / Deactivated)
   │
   ├── ✏️ Edit ─────────── fix name, email, batch, company…  → audit log lists the fields changed
   ├── ⏻ Deactivate ────── person disappears from directory, groups, chats
   │                       (history kept, can be switched back on)
   └── Export ──► choose columns
                  "Why are you exporting this?"  ← REQUIRED
                  cells a member set to "Only me" → "(hidden by member)"
                  → CSV downloads + audit log: who, what, why
```

**Try it:** as **Meera** → **Alumni records** → **Export** → write a reason → **Download CSV**. Then open **Audit log** to see your export and the reason.

---

### Flow 13: Logging conversations with alumni

**Why:** K1 says staff record each interaction by mode and category, with bulk upload.

```
Log interaction:  who · how (Call/Email/Meeting/Event/WhatsApp)
                  · about (Mentoring/Event/Placement/Fundraising/Data update/General)
                  · note · date

Bulk upload:      paste rows from Excel (or choose a .csv)
                  email, mode, category, note, date
                  → each row checked ✅ / ❌ with the reason
                  → only good rows are imported
```

**Try it:** as **Meera** → **Engagement log** → **Bulk upload**. The sample has **2 deliberate mistakes** (an unknown email and the mode "Phone"). Click **Import 2 rows**.

When staff open an alumnus's profile, it now shows that person's **engagement history** at the bottom (staff only).

---

### Flow 14: Merging duplicate records

**Why:** L4 and DM-3. After moving from the old portal, many people will have two records.

```
System compares every pair:  same email? same mobile? similar name?
                             same campus + batch? same company?
                     → "100% match" / "65% match" + the reasons
                                │
Sanjay → Review & merge:  pick which record to keep
                          pick the correct value for each field
                                │
                     → one record; posts, chats, job interest,
                       RSVPs, invites and engagement notes move across
                     → old record ID kept for traceability
```

**Sample duplicates:**

| Record 1 | Record 2 | Why flagged |
|---|---|---|
| Nikhil Deshpande | Nikhil Deshpand**ey** | Same mobile, 1 letter different, same campus + batch |
| Aditi Bhatia | Aditi **S.** Bhatia | Similar name, same campus + batch, same company |

**Try it:** as **Sanjay** → **Duplicates** → **Review & merge** → **Merge into one**. If two people are really different, click **Not the same person**.

---

### Flow 15: Cleaning up spellings (master lists)

**Why:** L5. "Bombay University", "MU" and "University of Mumbai" are the same college, and reports only add up if everyone uses one name.

```
Records contain:  "Xaviers Mumbai"   "Bombay University"   "IT Consulting"   "B.A. LL.B"
                         │                    │                   │                │
System suggests:  St. Xavier's College  Mumbai University    Consulting      (no guess:
                  (looks similar)       (known alias)        (looks similar)  BA LLB ≠ BBA LLB)
                         │
Sanjay clicks Standardise → records updated + spelling saved as an alias,
                            so next time it matches automatically
         or "Add as new"  → it becomes a new item on the list
```

**Try it:** as **Sanjay** → **Master lists** → **Colleges** → **Standardise**. Check the other two tabs.

---

### Flow 16: Moderation of reported content

**Why:** L6 and CS-7. Every post, job and profile can be reported, and response times must be tracked.

```
Member clicks 🚩 (on a post, job or profile) → picks a reason
        │
        ▼
Moderation queue (oldest first)
   timer: "8 h ago" … red "Overdue · 33 h" after 24 hours [TBC]
   actions:  Dismiss  ·  Warn member  ·  Remove post / Take job down / Deactivate account
        │
        ▼
Member gets an email · audit log entry · "Resolved" tab shows the response time
```

Reported **student chats** still go to **Safeguarding** (Phase 1). Moderation covers adult community content.

**Try it:**
1. As **Rohan** → **Batch groups** → click the 🚩 under Simran's post → **Send report**.
2. As **Meera** → **Moderation**: the selling post is already overdue → **Remove post**.

---

### Flow 17: Data and privacy requests (DPDP)

**Why:** A11, CS-11 and CS-15. People can see, download, correct and delete their data, and complain, and every request is tracked with a due date.

```
Member / parent                         Alumni office
     │                                       │
My data card:                                │
  Download data  → instant JSON file         │
  Correct something ─┐                       │
  Delete account ────┼──► Data requests ───► due date (30 days [TBC])
  Privacy complaint ─┘     (email receipt)    "Due within 7 days" warning
                                              Start → Mark done / Decline
                                              Deletion → name, email, mobile,
                                              work, profile wiped; account off
     │◄────────────── email with the reply ──────┘
```

**Where members find it:**
- **Alumni:** My profile → **My data** tab
- **Parents:** Consent centre → **"Aarav's data"** card (it replaced the Phase 1 placeholder buttons)

**Try it:** as **Neha** → **Consent centre**: Aarav's correction request shows **In progress**. As **Sanjay** → **Data requests** → the deletion request → **Delete & close**. The person becomes **"Deleted member"** in Alumni records.

---

### Flow 18: Permissions matrix

**Why:** A6. Each staff role gets only the access it needs.

```
Rahul (Super Admin) → Permissions
   rows = what (view records, export, merge, moderate, handle requests…)
   columns = Teacher · Campus Admin · Group office · Finance · MyCareerZ · Super Admin
   tick / untick → applies at once → audit log

   "live in demo" rows really change the screens.
   Fixed safety rules (CS-4, CS-5, CS-6, CS-16, A13, A6) can't be switched off by anyone.
```

**Try it:** as **Rahul** → **Permissions** → untick **Campus Admin → Export data**. Switch to **Meera** → **Alumni records**: the Export button is replaced by **"Your role can't export data"**.

---

## 3. Sample data added

| What | Count |
|---|---|
| Duplicate records | 2 pairs |
| Non-standard spellings | 4 (colleges, courses, industries) |
| Engagement notes | 7 |
| Data requests | 4 (copy, correction, deletion, complaint) |
| Reported content | 3 (selling post, possibly fake profile, misleading job) |

---

## 4. Items marked [TBC] (VIBGYOR to confirm)

| Item | Prototype assumption |
|---|---|
| Deadline for data requests | 30 days |
| Moderation response target | 24 hours |
| Grievance officer name | Not named yet |
| Which roles get which permission | Sensible defaults (see the matrix) |

These are worth adding to the **Open Questions** sheet in the Track B workbook.

---

## 5. Still not built

| Phase | What |
|---|---|
| **Phase 4: data migration** | Import wizard: upload Excel from the old portal → map fields → clean-up preview (uses Phase 3 duplicates and master lists) → reconciliation report (DM-1 to DM-4) |
| **Phase 5: R2 and R3 previews** | Mentor session booking, video library, digital ID card, chapters and news feed, donations with 80G receipt, store, MyCareerZ catalogue |

Not in Phase 3 (Should/Could items): engagement scoring (K2), saved segments (K3), retention settings (CS-12) and CMS (L7).
