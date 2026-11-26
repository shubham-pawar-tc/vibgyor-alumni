# VIBGYOR Alumni Platform: Prototype Phase 2

Phase 0–1 built the base and the 4 safety flows. This file explains **what Phase 2 adds** and **how each flow works**, step by step.

- **What it is:** the everyday **community** part of Release 1: profiles, directory, groups, chats, jobs, events and invites.
- **Run it:** `cd prototype` → `npm run dev` → http://localhost:3000
- **Demo only:** everything is saved in your browser, and no real messages are sent. They appear in the **Device simulator** (bottom right).
- **Start fresh:** click **Reset demo data** in the side menu (Phase 2 data is new, so old saved data resets automatically once).

---

## 1. What's new at a glance

| # | Feature | Who uses it | Page |
|---|---|---|---|
| 1 | **My profile** with privacy settings | Alumni (pending alumni too) | `/portal/profile` |
| 2 | **Student profile** (3C choices, interests, parent) | Students | `/portal/profile` |
| 3 | **Alumni directory** | Verified alumni, campus staff | `/portal/directory` |
| 4 | **Profile page** of another alumnus | Verified alumni, campus staff | `/portal/people/…` |
| 5 | **Batch groups** | Verified alumni | `/portal/groups` |
| 6 | **Chats** (alumni ↔ alumni) | Verified alumni | `/portal/chats` |
| 7 | **Jobs board** with approval | Alumni post, campus approves | `/portal/jobs` |
| 8 | **Internships for students** | Students | `/portal/jobs` |
| 9 | **Events** with RSVP and calendar | Alumni, students, parents | `/portal/events` |
| 10 | **Invite friends** with leaderboard | Verified alumni | `/portal/invite` |
| 11 | **Jobs & events** (staff) | Campus Admin, Group office | `/portal/admin/content` |

The **"Soon"** items in the side menu are now real pages, and the alumni **Home** shows live cards (profile %, jobs, group posts, upcoming events).

---

## 2. Who can see what (the most important rule)

```
                    Directory   Profiles   Groups   Chats   Jobs            Events
Verified alumni        ✅          ✅         ✅       ✅      ✅ all          ✅ alumni events
Pending alumni         🔒          own only   🔒       🔒      🔒              🔒
Students               ❌          ❌         ❌       ❌      ✅ internships  ✅ student events
                                                              (approved for
                                                               students only)
Parents                ❌          ❌         ❌       ❌      ❌              ✅ parent events
Campus staff           ✅ all      ✅ full    —        —       approve         create
                       (logged)    (logged)
```

- **Students and parents never see the alumni directory.** Students only talk to approved mentors (CS-4). If they open a directory link, they see "Not available for your account".
- **Pending alumni** can fill in their profile, but everything else opens only after the campus verifies them.
- **Staff** see full records. Every profile they open is written to the **Audit log**.

---

## 3. The flows

### Flow 5: An alumnus completes the profile and sets privacy

**Why:** The RFQ wants rich profiles (B1–B8) **and** per-field privacy (A10).

```
Rohan opens My profile
   │
   ├── Edit profile ── headline, job, company, city, LinkedIn
   │                   work history (timeline), education
   │                   achievements, skills, resume upload
   │                   "I'm hiring" / "Happy to speak" switches
   │
   ├── Privacy ─────── for each field choose:
   │                   All verified alumni · My batch only · Only me
   │                   (email, mobile, company, city, work, education)
   │
   └── Preview ─────── see the profile exactly as
                       • alumni from another batch
                       • a batchmate
                       • a student  → "Students can't see you"
```

**Try it**
1. Log in as **Rohan Gupta** → **My profile**. The bar at the top shows **Profile % complete**.
2. Add a role, a skill or an achievement. A green **Saved** tick appears.
3. Open **Privacy** and set **Current company** to **Only me**.
4. Open **Preview as others** → **Alumni from another batch**. The company now shows **"Company hidden"** 🔒.
5. Click **A batchmate**, then **A student**, to compare.

---

### Flow 6: Finding someone in the directory and chatting

**Why:** C1 (directory with filters) and D1 (alumni ↔ alumni messaging).

```
Rohan                            Directory                         Aditi
  │                                 │                                │
Search "consultant"     ──►   35 sample alumni, 39 campuses          │
or filter: campus, batch,      only fields each person shares        │
country, industry,             ("company hidden" if private)         │
My batch / Hiring / Mentors         │                                │
  │                                 ▼                                │
Opens Aditi's profile ──►  Message button  ──►  Chats  ──────►  Gets a push
                                                                notification
```

**Try it**
1. As **Rohan** → **Alumni directory**.
2. Type a company or click **My batch**, **Hiring** or **Mentors**.
3. Some cards say **"company hidden"**: that person chose to hide it.
4. Open a person → **Message** → type and send.
5. **Chats** also has an existing chat with **Arjun Nair** about a job referral.

Adult alumni chats are not masked or reviewed like student chats. Those rules apply only when a student is involved.

---

### Flow 7: Batch and campus groups

**Why:** C4 asks for batch and campus groups.

```
Every verified alumnus is added AUTOMATICALLY to:
   • Batch of 2006 · Malad, Mumbai     (same batch + same campus)
   • Malad, Mumbai alumni              (everyone from that campus)
→ post, like, see members → click a member to open their profile
```

**Try it:** As **Rohan** → **Batch groups**. You'll see the 2006 reunion thread. Write a post, like a post, and switch to the campus group.

---

### Flow 8: Posting a job and getting it approved

**Why:** E4 (jobs board), E5 (approval) and E6 (applications). Students may only see jobs the campus approves for them.

```
Rohan (alumni)                 System                    Meera (campus)               Others
     │                            │                            │                         │
Post a job  ──────────►  Hides phone numbers /    ──►   "Jobs to approve" queue          │
☐ also show to students   emails automatically          sees "Contact details found"     │
     │                     → "phone hidden"                    │                         │
Status: Waiting                                         Approve  /  Send back            │
for approval                                                   │                         │
     │◄────────── email: "Your job is live" ───────────────────┘                         │
     │                                                                                   │
"Posted by me" → see who's interested ◄──────────── alumni click "I'm interested" ◄──────┘
                                                    (with a note + their resume name)
```

**Try it**
1. As **Rohan** → **Jobs** → **Post a job**. In the description, type a phone number: a yellow warning appears.
2. Click **Send for approval**. Under **Posted by me** it shows **Waiting for approval**, and the number shows as **phone hidden**.
3. Switch to **Meera Joshi** → **Jobs & events** → **Jobs to approve** → **Approve**.
4. Back as Rohan, the job is **Live**. Rohan gets an email in the simulator.
5. Any other alumnus can click **I'm interested**. Rohan sees them under **See who**.

---

### Flow 9: A student shows interest in an internship (safely)

**Why:** E6 says student applications go **through the campus**, never directly to the company.

```
Diya (student)              Career counsellor (school)           Company / alumnus
     │                               │                                  │
Sees ONLY internships the            │                                  │
campus approved for students         │                                  │
     │                               │                                  │
"I'm interested"  ─────────►  Gets the request by email                 │
                              checks with the parent  ─────────►  only then is the
                                                                  application passed on
```

**Try it:** Log in as **Diya Iyer** → **Internships**. She sees only the Deloitte job-shadowing programme. Click **I'm interested**, then open the Device simulator: the email goes to **Mrs. Sheryl Fernandes (Career Counsellor)**, not to the company.

Aarav (no parent consent yet) sees the page but can't press the button.

---

### Flow 10: Events, RSVP and add to calendar

**Why:** G1 (create events) and G2 (RSVP, reminders, add to calendar).

```
Meera / Sanjay (staff)                   Alumni / Students / Parents
       │                                            │
New event: type, campus, date,                      │
time (IST), venue/online, capacity,                 │
WHO can sign up: ☑ Alumni ☐ Students ☐ Parents      │
       │                                            │
       └────────── shows only to the right people ─►│
                                                    │
                          Going / Maybe / Can't go  │
                          +1 guest (reunions)       │
                          seats counter, "Full"     │
                          WhatsApp/email confirmation
                          Add to calendar (.ics) / Google
       │                                            │
"Events" tab: % full, going / maybe  ◄──────────────┘
```

**Sample events**

| Event | Date | For |
|---|---|---|
| Career talk: commerce after Class 12 | 1 Dec | Students + parents (Malad) |
| Studying in the UK: alumni panel | 4 Dec | Alumni, students, parents (all campuses) |
| Bengaluru chapter meetup | 11 Dec | Alumni |
| Malad Alumni Reunion 2026 | 20 Dec | Alumni (Malad) |

**Try it**
1. As **Rohan** → **Events** → **Going** on the reunion → tick **Bringing a +1** → **Add to calendar (.ics)** downloads a calendar file.
2. As **Diya**, only the career talk and the UK webinar appear.
3. As **Meera** → **Jobs & events** → **New event**. If you tick **Students**, a warning reminds you that student events must be in school or online with staff present.

---

### Flow 11: Invite friends

**Why:** C11 asks for invites by email, WhatsApp or link, with a referral leaderboard.

```
Rohan → Invite by email or WhatsApp, or copy his personal link
      → friend receives the message (Device simulator)
      → link opens /join → friend still goes through VERIFICATION
      → "Your invites": Invited / Joined
      → "Top inviters" leaderboard (Arjun Nair leads with 4 joined)
```

**Try it:** As **Rohan** → **Invite friends** → choose **WhatsApp** → type any number → **Send invite**. It appears in the simulator and in "Your invites".

---

## 4. Student profile

| Section | What it does |
|---|---|
| **My 3C choices** | Edit up to 3 Country / Course / College choices. Mentor matching uses these. |
| **Interests** | Add or remove tags (clubs, sports, olympiads) |
| **From school records** | Name, class, campus. Read-only: "ask your class teacher". |
| **My parent / guardian** | Shows who gives consent |
| **Who sees your profile?** | Only mentors the student messages. Never the directory. |

---

## 5. Sample data added

- **24 more verified alumni** (35 profiles now appear in the directory) across several campuses, cities and industries. Some hide their company or city, so privacy can be seen.
- **2 more alumni in Rohan's batch (2006, Malad)**, so his batch group isn't empty.
- **5 jobs:** 4 live, 1 waiting for approval (with a hidden phone number).
- **4 events**, from 1 Dec to 20 Dec.
- **Group posts**, **1 chat** (Rohan ↔ Arjun) and **18 invites** for the leaderboard.

---

## 6. RFQ requirements covered in Phase 2

| Area | Requirement IDs |
|---|---|
| Alumni profile | B1, B2, B4, B5, B6, B7, B8, B16 |
| Privacy per field | A10 |
| Student profile | B10, B11, B13 |
| Directory | C1 |
| Groups | C4 |
| Invites and leaderboard | C11 |
| Alumni chat | D1 |
| Jobs | E4, E5, E6, CS-4 |
| Events | G1, G2 |
| Reports | M4 (RSVP numbers) |
| Audit | A12 (staff viewing profiles is logged) |

Each page shows its IDs as small grey tags at the top.

---

## 7. Still not built (next phases)

| Phase | What |
|---|---|
| **Phase 3: staff and admin views** | **Now built.** See `PROTOTYPE_PHASE_3.md` |
| **Phase 4: data migration** | Import wizard: upload Excel → map fields → clean-up preview → reconciliation report |
| **Phase 5: R2 and R3 previews** | Mentor session booking, video library, digital ID card, chapters and news feed, donations with 80G receipt, store, MyCareerZ catalogue |

Not in Phase 2 on purpose: follow/connect (C2), city chapters (C5) and the news feed (C6). They are "Should" items and fit better with the Phase 5 previews.
