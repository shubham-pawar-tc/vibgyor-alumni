# VIBGYOR Alumni Platform: Prototype Phase 0 and Phase 1

This file explains **what is built** in the prototype and **how each flow works**, step by step.

- **Where the code is:** `prototype/` folder
- **How to run:** `cd prototype` → `npm run dev` → open http://localhost:3000
- **Important:** this is a **demo only**. There is no real server or database. Everything is saved in your browser. No real SMS, WhatsApp or email is sent. They appear in the **Device simulator** (dark button, bottom right of every page).

---

## 1. The big picture

The RFQ asks for a platform that does 4 main jobs:

1. **Alumni** connect with each other.
2. **Students** (Class 8–12, mostly under 18) get guidance from alumni, **safely**.
3. **School staff** keep one clean list of alumni.
4. Interested students and parents are sent to **MyCareerZ**, with consent.

When VIBGYOR shortlists vendors, it will ask them to show **4 things live** (RFQ section 22.2):

| # | What VIBGYOR wants to see |
|---|---|
| 1 | A parent giving consent |
| 2 | A student contacting a mentor |
| 3 | An alumnus being verified |
| 4 | A campus sending a broadcast |

- **Phase 0** = the base (design, website, login, people, sample data).
- **Phase 1** = these 4 flows, working end to end.

---

## 2. Phase 0: Foundation (what is there)

### 2.1 Design
- VIBGYOR colours: violet as the main colour, with the rainbow (V-I-B-G-Y-O-R) as a thin line at the top.
- Light mode and dark mode (moon/sun button at the top).
- Works on mobile phones (tested at 375px wide) as well as desktop.

### 2.2 Public website (no login needed)

| Page | Address | What it does |
|---|---|---|
| Home | `/` | About VAA, safety features, MyCareerZ programmes, buttons to join or log in |
| Enquiry form | `/enquiry` | Send a question to Admissions, the Alumni office or MyCareerZ. For MyCareerZ, a consent tick box is required. |
| Login | `/login` | Log in with email/mobile + one-time code, or password. Staff need a second code. |
| Join | `/join` | **Alumni only**: sign up, or claim an old profile |
| Demo guide | `/demo` | The 4 stories with a "Start tour" button for each |

### 2.3 Who can sign up?

| Person | Signs up? | How they get an account |
|---|---|---|
| Alumni | **Yes** | Sign up, or claim their old profile from the previous portal |
| Students | No | The school creates them from school records |
| Parents | No | Invited on the mobile/email the school already has |
| All staff | No | Created by an admin |

### 2.4 The people in the demo

| Name | Role | Used for |
|---|---|---|
| Aarav Mehta | Student, Class 11 | Account locked, waiting for parent |
| Diya Iyer | Student, Class 12 | Already allowed to talk to mentors |
| Neha Mehta | Parent | Aarav's mother, gives consent |
| Priya Sharma | Alumni + Mentor | Answers student questions |
| Dr. Ananya Desai | Alumni + Mentor | Already chatting with Diya |
| Rohan Gupta | Alumni (batch 2006) | Vouches for a batchmate, can become a mentor |
| Sneha Kulkarni | Alumni (not verified yet) | Waiting for verification |
| Meera Joshi | Campus Admin (Malad) | School staff for one campus |
| Sanjay Verma | Group Alumni Office | Head office, all 39 campuses |
| Rahul Menon | Super Admin | Settings |
| Teacher, Finance, MyCareerZ | Staff | Home page only, for now |

You can become any of them with **"Switch role"** at the top of the portal.

### 2.4a Logging in as a parent or student (real login form)

Go to `/login`, type one of these, click **Send code**, then **Autofill demo code**, then **Verify & sign in**.

| Person | Type this | Code sent by | What you see |
|---|---|---|---|
| Neha Mehta (parent) | `9820045210` or `neha.mehta@example.com` | SMS | Parent home with Aarav's status and permissions |
| Aarav Mehta (student) | `aarav.mehta@student.example.in` | Email | Locked page, waiting for parent |
| Diya Iyer (student) | `diya.iyer@student.example.in` | Email | Student home, can find mentors |
| Lakshmi Iyer (parent) | `9819377421` | SMS | Diya's permissions |

Or click a card under **"Demo accounts"** on the same page to skip the code step.

### 2.5 Sample data
- 39 campuses (sample names)
- 4,650 alumni (matches the RFQ count), spread over batches 2004–2026 and 25 countries
- School records (ERP) for a few alumni, used for automatic checking
- 2 profiles "migrated" from the old portal, used for "claim your profile"

### 2.6 Helper tools (demo only)
- **Device simulator:** shows every SMS, WhatsApp, email and push message the platform sends, including OTP codes.
- **Autofill demo code:** fills the OTP for you.
- **Guided tour:** a box that tells you who you are and what to click.
- **Reset demo data:** puts everything back to the start.

---

## 3. Phase 1: The 4 flows

### Flow 1: A parent gives permission

**Why:** Indian law (DPDP Act 2023) says a child's account needs a **parent's verified consent** first.

```
Aarav (student)          Neha (parent)                      Aarav (student)
      │                        │                                   │
Account is LOCKED  ──►  Gets SMS + WhatsApp + email  ──►  Enters one-time code
      │                        │                                   │
      │                 Chooses 3 permissions separately           │
      │                 ☐ Use the platform (needed)                │
      │                 ☐ Talk to mentors                          │
      │                 ☐ Share with MyCareerZ                     │
      │                        │                                   │
      └────────────────────────┴──────────────►  Account is OPEN ◄─┘
```

**Steps in the prototype**
1. Log in as **Aarav**. He sees "you're nearly in" and a lock.
2. Click **"Ask my parent now"**. Messages go to Neha's phone (see the Device simulator).
3. In the simulator, tap **"Open consent link"**.
4. Neha clicks **"Send code to my mobile"**, then enters the code (or uses Autofill).
5. Neha switches on the permissions she wants, ticks **"I am the parent"**, and confirms.
6. Aarav's account is now **active**.
7. Later, Neha opens **Consent centre** and switches off "Talk to mentors". Aarav loses mentor access **immediately**.

**What is saved:** who gave consent, when, which notice version, and the OTP reference.

**Screens:** student locked page · parent consent page (4 steps) · parent consent centre · staff consent tracker

---

### Flow 2: A student contacts a mentor

**Why:** Students talk to adults outside school, so it must be **safe and supervised**.

```
Diya (student)                 System (automatic)              Meera (school staff)
      │                               │                                │
Sees ONLY approved mentors            │                                │
(best match to her choices)           │                                │
      │                               │                                │
Asks a question  ───────────►  Hides phone / email /  ───────►  Gets an alert
"call me on 98200 12345"       link / Instagram                        │
                               → "[phone hidden]"               Reads the chat
                                      │                         (this is logged)
                               Chat is recorded,                       │
                               cannot be deleted                Can SUSPEND the
                                                                mentor instantly
```

**Steps in the prototype**
1. Log in as **Diya** → **Find a mentor**.
2. She sees only alumni with the **Mentor badge**, sorted by match % with her 3 choices (Country, Course, College).
3. Click **"Ask a question"** and type a question with a phone number. A **yellow warning** appears while typing.
4. Send. In the chat, the number shows as **"phone hidden"**.
5. Any message can be **reported** (Report button).
6. Switch to **Meera** → **Safeguarding**. An automatic alert is waiting.
7. Meera can **view the chat**, **dismiss**, **send a warning**, or **suspend the mentor's badge**.
8. After a suspension, the mentor disappears from student search and the chat becomes **read-only**.

**Other safety rules shown**
- No video call button for students (not allowed in Release 1).
- If the parent switches off mentor contact, the chat locks.
- Mentors must accept a **6-point safety code of conduct** before getting the badge.

**Screens:** find a mentor · chat · report popup · safeguarding (reports, conversations, mentor badges) · become a mentor

---

### Flow 3: A former student joins (verification)

**Why:** Only **real VIBGYOR alumni** should be able to talk to students.

```
                         Former student signs up
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     Details MATCH          Small difference       No school record
     school records         (e.g. typo)            (old batch)
              │                    │                    │
              ▼                    ▼                    ▼
     ✅ Verified at once    Campus staff checks    Campus staff checks
                            side by side           OR 2 batchmates vouch
                                   │                    │
                                   ▼                    ▼
                               ✅ Approved          ✅ Verified
```

There is also a 4th path: **Claim old profile** → find with old email → code → if it was verified before, it **stays verified**.

**Steps in the prototype**
1. Go to **Join** → **"I'm new here"**.
2. Use the demo buttons:
   - **"Fill an exact match"** → verified instantly
   - **"Fill a typo"** → sent to the campus queue
   - **"Fill a 2007 batch"** → queue + vouch link
3. Or choose **"Claim my existing profile"** with `karan.malhotra@example.com`.
4. Switch to **Meera** → **Verification**. She sees **Submitted vs School record** with ✓ ⚠ ✗ for each field, then Approve / Ask for info / Reject.
5. Switch to **Rohan** (batch 2006) → **Vouch for batchmates** → vouch for Sneha. That's her 2nd vouch, so she is **verified**.
6. **Badge requests** tab: Meera approves new mentors.

**Screens:** join (claim / sign up / code / result) · pending alumni status · vouch page · verification queue

---

### Flow 4: The school sends a message (broadcast)

**Why:** Staff need one place to reach alumni by email, WhatsApp and app, **only if alumni agreed**.

```
Meera (campus staff)                      System                        Alumni
       │                                    │                              │
1. Who?  campus (locked) + batches     Removes people who                 │
         + country + segment           said NO to a channel                │
       │                               Never includes students             │
2. How?  ☑ Email ☑ WhatsApp ☑ Push          │                              │
       │                                    │                              │
3. What? subject + message +                │                              │
         approved WhatsApp template ───────►│──── Sends ─────────────────►│
       │                                    │                              │
4. When? now or later              Shows: delivered / opened / clicked     │
```

**Steps in the prototype**
1. Log in as **Meera** → **Broadcasts** → **New broadcast**.
2. Her campus is **locked to Malad** (she can't message other campuses).
3. Change batches or country. The right side shows **how many people** each channel will reach, after opt-outs.
4. Preview it on a phone (WhatsApp / Email / Push).
5. Click **Send**. It shows "Sending", then "Delivered" with numbers.
6. Switch to **Sanjay** (head office). He can choose **all 39 campuses**.
7. **Audit log** shows the send.

**Screens:** broadcast list · broadcast composer · audit log

---

## 4. Extra screens in Phase 1

| Screen | Who | What it does |
|---|---|---|
| Dashboard | Campus Admin / Head office | Numbers, work queues, data completeness, recent activity, campus table (head office) |
| Student consents | Campus Admin | Each student's consent status, send reminders, age-gate note |
| Audit log | Staff | Every action: who, what, when. Export needs a reason. |
| Settings | Super Admin | Lowest class allowed per campus (age gate) |
| Role home pages | Teacher, Finance, MyCareerZ | What they will get later and their access limits |

---

## 5. All pages at a glance

| Address | Page | Phase |
|---|---|---|
| `/` | Home | 0 |
| `/enquiry` | Enquiry form | 0 |
| `/login` | Login | 0 |
| `/join` | Alumni join / claim | 1 (Flow 3) |
| `/consent/stu1` | Parent consent | 1 (Flow 1) |
| `/demo` | Guided demo | 0 |
| `/portal` | Home / dashboard for each role | 0 |
| `/portal/consent` | Parent consent centre | 1 (Flow 1) |
| `/portal/mentors` | Find a mentor | 1 (Flow 2) |
| `/portal/messages` | Chat | 1 (Flow 2) |
| `/portal/mentor` | Become a mentor | 1 (Flow 2) |
| `/portal/vouch` | Vouch for batchmates | 1 (Flow 3) |
| `/portal/admin/verification` | Verification queue | 1 (Flow 3) |
| `/portal/admin/safeguarding` | Safeguarding | 1 (Flow 2) |
| `/portal/admin/consents` | Student consents | 1 (Flow 1) |
| `/portal/admin/broadcast` | Broadcasts | 1 (Flow 4) |
| `/portal/admin/audit` | Audit log | 1 |
| `/portal/admin/settings` | Settings | 1 |

---

## 6. Not built yet (later phases)

- **Phase 2 (rest of Release 1): now built.** See `PROTOTYPE_PHASE_2.md` (profiles and privacy, directory, groups, chats, jobs, events, invites).
- **Phase 3:** staff and admin views (duplicate merge, master lists, permissions, data requests)
- **Phase 4:** data import and clean-up from the old portal
- **Release 2:** Google/LinkedIn login, news feed, mentor video sessions, video library, ID card
- **Release 3:** payments, donations (80G), store, document requests, mobile apps

---

## 7. RFQ requirements shown in Phase 0–1

| Area | Requirement IDs |
|---|---|
| Login and roles | A3, A6, A13 |
| Sign-up and verification | A1, A2, DM-5 |
| Consent | A9, CS-1, CS-2, CS-3, CS-11 |
| Safe messaging | D2, CS-4, CS-5, CS-6, CS-7, CS-8, CS-9 |
| Mentoring | E1, C7, B10 |
| Broadcasts | D4, D5, D7, INT-2, INT-3, CS-10 |
| Audit and export | A12, CS-16, L3 |
| MyCareerZ enquiry | F5, MCZ-1, J4 |
| Dashboards | M1, M2, M3 |

Each screen shows its requirement IDs as small grey tags (for example `CS-6`).
