# VIBGYOR Alumni Platform: Teacher / Counsellor Flow

> Role code **TCH**. Built from the prototype source (`src/components/Homes.tsx` → `RoleOverview` / `roleFeatures.TCH`, `components/AppShell.tsx`, `app/login/page.tsx`, `lib/store.tsx` → `markInterest`, `lib/data.ts` → `seedPermissions`, `app/portal/admin/engagement/page.tsx`). Demo persona: **Mrs. Sheryl Fernandes (`tch1`)**, Teacher · Malad. See also [STUDENT-FLOW.md](STUDENT-FLOW.md) and [CAD-FLOW.md](CAD-FLOW.md).

> ⚠️ **Prototype status:** the teacher sees a **role overview** only. The full workspace is planned for a later phase. This file shows what is built today and the planned flow.

---

## 1. What a teacher / counsellor is on the platform

| Item | Detail |
|---|---|
| Who | Class teacher or career counsellor at one campus |
| Login | OTP + **2-factor** (all staff) |
| Scope | **Own campus only** |
| Menu (today) | **Home** (role overview) · **Student interest** · **Engagement log** |
| Capabilities (default matrix) | `engagement.log` (log alumni interactions). Nothing else |

### Built today

| # | What | Where |
|---|---|---|
| 1 | Sign in with OTP + 2-factor code | `/login` |
| 2 | See the role overview: planned workspace and access limits | `/portal` |
| 3 | **Receive students' internship interest** by email: *"Student interest – <job>. <Student> (Class N) is interested… Please check with the parent before passing the application on."* | Email to every active teacher on the student's campus, with a link to **Student interest** |
| 4 | Log alumni interactions, own campus (single or bulk CSV) | Engagement log |

### Planned workspace (from the role overview)

| Feature | Purpose |
|---|---|
| Student 3C preferences and interests | See what each student is aiming for |
| Mentor match suggestions | Suggest the right mentors to students |
| Career talk requests | Ask alumni to give talks at the campus |
| Campus events | See and promote campus events |

### Access limits

- ✅ Own campus only
- ❌ Can't broadcast
- ❌ Can't export data
- ❌ Can't read student–mentor chats, approve verifications, or moderate
- ✅ 2-factor login

---

## 2. Flow 1: Login

```mermaid
flowchart LR
    A([/login → Staff]) --> B[Email / mobile]
    B --> C[OTP]
    C --> D[2-factor code]
    D --> E[Role overview<br/>'Hello, Sheryl']
    E --> F[Your workspace<br/>arrives in a later phase]
    E --> G[Access limits<br/>own campus · no broadcast/export · 2FA]
```

---

## 3. Flow 2: Student internship interest (built)

```mermaid
sequenceDiagram
    autonumber
    actor S as Student (Diya)
    participant P as Platform
    actor T as Teacher / counsellor
    actor N as Parent

    S->>P: Internships → I'm interested
    P->>T: Email: "Student interest – Job-shadowing week.<br/>Diya Iyer (Class 12) is interested…<br/>check with the parent first"
    P-->>S: "Sent to your counsellor"
    T->>P: Student interest → Update → Checking with parent
    P-->>S: "Counsellor is checking with your parent"
    T->>N: Talks to the parent
    T->>P: Update → Passed on (or Not taking it forward) + note
    P-->>S: Notification with the note
    P-->>N: WhatsApp "[Diya · Class 12] … passed on" + note
```

Students never contact employers directly. The company only hears from the counsellor.

---

## 4. Flow 3: Planned teacher workspace

```mermaid
flowchart TD
    A([Teacher home]) --> B[My students<br/>own campus, consented only]
    B --> B1[3C choices + interests]
    B1 --> B2[Mentor match suggestions<br/>by country · course · college]
    B2 --> B3[Suggest a mentor to the student]
    A --> C[Internship interest inbox]
    C --> C1[Check with parent → pass on / decline]
    A --> D[Career talk requests]
    D --> D1[Pick alumni speaker → request]
    D1 --> D2[Campus Admin creates the event]
    A --> E[Campus events]
    A --> F[Engagement log<br/>log a talk, call or meeting with an alumnus]
```

---

## 5. Gaps and fixes

| # | Item | Status |
|---|---|---|
| 1 | Teacher had `engagement.log` but no menu link, and the page blocked them | ✅ **Fixed.** TCH menu: **Home · Engagement log**. The page allows TCH, scoped to their own campus |
| 2 | Internship interest went to the **first** teacher on the campus, with no inbox | ✅ **Fixed.** Every teacher on the campus is emailed. *Student interest* (`/portal/teacher/interest`) lists own-campus students with tabs *To handle* / *Done*, the student's note, parents and consent; *Update* sets Checking with parent / Passed on / Declined with a note. The student sees the status on the job card; parents get a WhatsApp when it's passed on or declined |
| 3 | Admin pages had no role guard | ✅ **Fixed.** A teacher opening any other admin page sees *"Staff only"* |
| 4 | Whole workspace (3C view, match suggestions, talk requests) not built yet | Planned for a later prototype phase |
