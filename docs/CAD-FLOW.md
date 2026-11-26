# VIBGYOR Alumni Platform: Campus Admin Flow

> Role code **CAD**. Built from the prototype source (`src/components/Homes.tsx` → `StaffDashboard`, `components/AppShell.tsx`, `components/admin.tsx` → `useScope`, `lib/store.tsx` → `can` and admin actions, `lib/data.ts` → `seedPermissions`, and every page under `app/portal/admin/`). Demo persona: **Meera Joshi (`cad1`)**, Campus Admin · Malad (pilot). See also [GAO-FLOW.md](GAO-FLOW.md) and [SAD-FLOW.md](SAD-FLOW.md).

---

## 1. What a Campus Admin is on the platform

| Item | Detail |
|---|---|
| Who | Alumni office staff for **one campus** |
| Login | OTP + **2-factor** |
| Scope | **Own campus only** (queues, records, reports, broadcasts, exports) |
| Main job | Keep the community verified and safe; run campus communication |

### Menu

| Section | Pages |
|---|---|
| — | **Dashboard** |
| Queues | **Verification** · **Safeguarding** · **Moderation** · **Data requests** · **Jobs & events** |
| People & data | **Alumni records** · **Engagement log** · **Student consents** |
| Communication | **Broadcasts** |
| Governance | **Audit log** |

Not for CAD: Duplicates, Master lists (GAO / SAD), Permissions, Settings (SAD).

### What a Campus Admin can do (default permissions)

| Capability | CAD | What it means |
|---|---|---|
| View alumni records | ✅ | Full record for own campus; every view logged |
| Edit or deactivate records | ✅ | Fix details, switch accounts off |
| Export data (with a reason) | ✅ | Reason recorded in the audit log |
| Approve alumni verification | ✅ | Approve / ask for info / reject; approve Mentor badges |
| Read student–mentor chats | ✅ | Open transcripts from Safeguarding (logged) |
| Send broadcasts | ✅ | Own campus audiences |
| Moderate reported content | ✅ | Posts, profiles, jobs |
| Handle data & privacy requests | ✅ | Access, correction, deletion, complaint |
| Log alumni interactions | ✅ | Engagement log, single or bulk CSV |
| Merge duplicates / edit master lists | ❌ | Group Alumni Office |

The Super Admin can change these live on **Permissions**.

### Fixed safety rules (no role can switch these off)

- Students see and contact only Mentor-badged alumni (CS-4)
- Contact details are masked in student chats (CS-6)
- Student chats can't be deleted by anyone (CS-5)
- Every staff view or export of student data is logged (CS-16)
- Staff accounts always use 2-factor login (A13)
- Campus Admins only see their own campus (A6)

---

## 2. Master flow

```mermaid
flowchart TD
    A([Login: OTP + 2FA]) --> B[Campus dashboard · Malad]
    B --> Q{Work queues}
    Q --> V[Verification<br/>alumni + Mentor badges]
    Q --> S[Safeguarding<br/>reports · chats · badges]
    Q --> M[Moderation<br/>posts · profiles · jobs]
    Q --> R[Data requests<br/>30-day due date]
    Q --> J[Jobs & events<br/>approve jobs · create events]
    B --> P{People & data}
    P --> AR[Alumni records<br/>edit · deactivate · export]
    P --> EL[Engagement log]
    P --> SC[Student consents<br/>send reminders]
    B --> BR[Broadcasts]
    B --> AU[Audit log]
```

---

## 3. Flow 1: Dashboard

```mermaid
flowchart LR
    A([Campus dashboard]) --> B[Stats: Alumni records · Active mentors ·<br/>Open safety reports 24h target ·<br/>Awaiting parent consent]
    A --> C[Work queues with counts:<br/>Alumni verifications · Mentor badge requests ·<br/>Safeguarding reports · Students awaiting consent]
    A --> D[Data completeness KPIs]
    A --> E[Campus-scoped access note]
    A --> F[Recent activity → Audit log]
    A --> G[New broadcast]
```

---

## 4. Flow 2: Alumni verification and Mentor badges

```mermaid
flowchart TD
    A([Verification]) --> T1[Alumni queue]
    A --> T2[Badge requests]
    A --> T3[Decided]
    T1 --> B[Select a person]
    B --> C[Side by side: submitted vs school record<br/>Name · Pass year · Admission no. · Campus<br/>✅ Match · ⚠ Close match · ❌ Mismatch · – No record]
    C --> D[Vouches so far 0/2]
    C --> E{Decision}
    E -- Approve --> F[Role → Verified<br/>WhatsApp 'Welcome back!']
    E -- Info needed --> G[Note → WhatsApp:<br/>'please upload a school ID…']
    E -- Reject --> H[Reason → WhatsApp]
    T2 --> I[Request: motivation ·<br/>code of conduct accepted date]
    I --> J{Approve?}
    J -- Yes --> K[Mentor badge active<br/>visible to consented students]
    J -- No --> L[Rejected]
```

All decisions go to the audit log.

---

## 5. Flow 3: Safeguarding

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant P as Platform
    actor C as Campus Admin (Meera)
    actor M as Mentor

    S->>P: Message with a phone number
    P->>P: Masks it → "[phone hidden]"
    P->>C: Auto-flag in Safeguarding → Reports
    S->>P: (or) Report a message
    P->>C: User report
    C->>P: Open conversation transcript
    P->>P: Chat view logged (audit)
    alt Nothing wrong
        C->>P: Dismiss
    else Minor
        C->>P: Send a warning
    else Serious
        C->>P: Suspend Mentor badge (confirm)
        P-->>M: Badge suspended, hidden from students
        P-->>S: Chat read-only
    end
```

| Tab | What's there |
|---|---|
| **Reports** | Auto-flags (masking) and user reports; show closed toggle |
| **Student conversations** | Every student–mentor chat on the campus; open transcript (masked parts highlighted) |
| **Mentor badges** | Every mentor; suspend or reinstate |

Target: respond within **24 hours**.

---

## 6. Flow 4: Moderation, data requests, jobs & events

```mermaid
flowchart TD
    MO([Moderation]) --> MO1[Waiting: reported posts, profiles, jobs]
    MO1 --> MO2{Action}
    MO2 --> MO3[Dismiss] & MO4[Remove] & MO5[Warn]
    MO3 & MO4 & MO5 --> MO6[Resolved tab]

    DR([Data requests]) --> DR1[Open: access · correction ·<br/>deletion · complaint<br/>due in 30 days, 'due within 7 days' warning]
    DR1 --> DR2[Start → In progress]
    DR2 --> DR3{Type}
    DR3 -- Access --> DR4[Download file · Mark done]
    DR3 -- Deletion --> DR5[Delete & close<br/>name, contact, profile wiped<br/>→ 'Deleted member']
    DR3 -- Other --> DR6[Mark done / Decline with note]
    DR4 & DR5 & DR6 --> DR7[Email reply to the person]

    JE([Jobs & events]) --> JE1[Jobs to approve<br/>'Contact details found' warning<br/>'Wants to reach students' flag]
    JE1 --> JE2[Approve → live / Reject → 'needs changes']
    JE --> JE3[Events → New event<br/>title · type · campus · date · time ·<br/>hours · capacity · audience: Alumni / Students / Parents]
    JE3 --> JE4{Online event?}
    JE4 -- No --> JE5[Venue required]
    JE4 -- Yes --> JE6[Meeting link required https://…<br/>Zoom / Meet / Teams / YouTube Live<br/>venue text optional]
    JE6 --> JE7[Attendees who tapped Going get<br/>Join now from 15 min before start ·<br/>staff card shows link + 'N joined online']
```

---

## 7. Flow 5: Records, engagement, consents

```mermaid
flowchart LR
    AR([Alumni records]) --> AR1[Search · status: verified / pending / deactivated]
    AR1 --> AR2[Edit record]
    AR1 --> AR3[Deactivate / reactivate]
    AR1 --> AR4[Export with a reason<br/>→ audit log]
    AR1 --> AR5[Send login link<br/>one person or ticked people]

    EL([Engagement log]) --> EL1[Log an interaction:<br/>alumnus · mode · category · note · date]
    EL --> EL2[Bulk upload: paste CSV / .csv<br/>email, mode, category, note, date]
    EL --> EL3[Filter by mode / category]

    SC([Student consents]) --> SC1[Every student on campus:<br/>status · guardians · Platform / Mentor / MyCareerZ]
    SC1 --> SC2[Select awaiting → Send reminder<br/>to every guardian]
    SC --> SC3[Age gate note: Class 8+<br/>set by Super Admin]
```

### Sending a login link (onboarding)

```mermaid
flowchart TD
    A([Alumni records]) --> B{One or many?}
    B -- One --> C[Send icon on the row]
    B -- Many --> D[Tick people · or tick all in the filtered list]
    D --> E[Send login link N]
    C & E --> F[Choose channels: Email · WhatsApp · SMS]
    F --> G[Edit message · placeholders:<br/>first_name · login_id · login_link · campus · batch]
    G --> H[Live preview for the first person]
    H --> I[Send]
    I --> J[Each person gets their own message:<br/>personal link vaa.vibgyor.in/login?id=email<br/>+ 4 sign-in steps]
    I --> K[Row shows 'Link sent 2m ago']
    I --> L[Audit log: 'Login link sent' · channels · skipped]
    J --> M[Alumnus taps link → login ID pre-filled<br/>→ Send code → 6-digit OTP → in]
```

| Rule | Detail |
|---|---|
| Who can send | Anyone with *Edit or deactivate records* (CAD, GAO, SAD by default) |
| Credentials | **No passwords are sent.** The message gives the login ID (registered email) and a link that pre-fills it; sign-in still needs the one-time code |
| Skipped | Deactivated people; WhatsApp / SMS skipped for people with no mobile (they still get email if chosen) |
| Pending alumni | Message adds: *"your campus is still verifying you. You can complete your profile meanwhile"* |
| Re-sending | Allowed; the modal warns how many were already sent a link; the row shows the latest time |
| SMS | Short version: first paragraph + `vaa.vibgyor.in/login` |

Default message:

```
Hi {{first_name}},

Your VIBGYOR Alumni Association profile ({{campus}}, Batch {{batch}}) is ready. Sign in here: {{login_link}}

How to sign in (no password needed):
1. Open the link above, or go to vaa.vibgyor.in/login
2. Your login ID is {{login_id}} (already filled in if you use the link)
3. Tap "Send code" and enter the 6-digit code we send you
4. Check your details, set your privacy, and say hello to your batch

We'll never ask for a password or the code over phone or email.

VIBGYOR Alumni Office
```

---

## 8. Flow 6: Broadcasts and audit log

```mermaid
flowchart TD
    B([Broadcasts → New]) --> B1[1 · Audience<br/>verified, opted-in adult alumni only<br/>Campus: locked to own campus ·<br/>Segment: all verified / mentors only ·<br/>Batches: from–to · Where they live:<br/>anywhere / outside India / a city]
    B1 --> B2[2 · Channels<br/>Email · WhatsApp · SMS · Push<br/>opt-outs removed automatically]
    B2 --> B3[3 · Message<br/>subject · body · first_name merge]
    B3 --> B4[4 · Schedule<br/>Send now / Schedule]
    B4 --> B5[Preview: recipient count ·<br/>sample to self]
    B5 --> B6[Sent / Scheduled → delivery stats]

    A([Audit log]) --> A1[Every admin, consent, safeguarding,<br/>data-access action · can't be edited]
    A1 --> A2[Filter by category]
    A1 --> A3[Export with reason to share<br/>→ itself logged]
```

Students and parents are never broadcast audiences.

---

## 9. Gaps and fixes

| # | Item | Status |
|---|---|---|
| 1 | Admin pages could be opened by any signed-in user who typed the URL | ✅ **Fixed.** Every `/portal/admin/*` page is wrapped in `AdminOnly` (CAD / GAO / SAD; the Engagement log also allows TCH). Others see *"Staff only"* |
| 2 | `verify`, `chats.read`, `broadcast.send`, `records.view` weren't checked | ✅ **Fixed.** Verification and badge decisions need `verify`; *View conversation* needs `chats.read`; *New broadcast* needs `broadcast.send`; Alumni records and the staff directory need `records.view`. Without the capability the page shows *"Your role can't …"* |
| 3 | Moderation of jobs is split: approval in *Jobs & events*, reports in *Moderation* | Open: link the two, or show reported jobs in Jobs & events |

---

## 10. Quick demo script

1. Log in as **Meera** (OTP + 2FA) → Campus dashboard · Malad.
2. **Verification** → pick a pending alumnus → compare fields → **Approve**.
3. **Badge requests** → approve a mentor.
4. As **Diya**, send a mentor a message with a phone number. As Meera → **Safeguarding** → auto-flag → open transcript → **Suspend badge**.
5. **Data requests** → Aarav's correction (in progress) → **Mark done**.
6. **Jobs & events** → approve a job → **New event** for students and parents.
7. **Student consents** → select students awaiting → **Send reminder**.
8. **Broadcasts** → audience *Batch 2016* → WhatsApp + email → preview → send.
9. **Audit log** → see every action above.
