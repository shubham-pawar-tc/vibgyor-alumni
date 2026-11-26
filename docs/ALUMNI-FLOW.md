# VIBGYOR Alumni Platform: Alumni Flow

> Role codes **ALP** (Alumni – Pending) and **ALU** (Alumni – Verified), plus the **Mentor badge** an ALU can hold. Built from the prototype source (`src/app/join/page.tsx`, `lib/store.tsx` → `submitVerification` / `decideVerification` / `vouch` / `applyBadge` / `decideBadge` / `postJob` / `sendInvite`, `components/Homes.tsx` → `PendingAlumniHome` / `AlumniHome`, `app/portal/profile/page.tsx`, `lib/community.ts` → `canSee` / `groupsFor`, `app/portal/directory`, `groups`, `chats`, `jobs`, `events`, `invite`, `vouch`, `mentor`, `messages`). See also [STUDENT-FLOW.md](STUDENT-FLOW.md) and [PARENT-FLOW.md](PARENT-FLOW.md).

Demo personas: **Priya Sharma (`alu1`)**, verified mentor · **Rohan Gupta (`alu7`)**, verified, not a mentor · **Sneha Kulkarni (`alp1`)**, pending.

---

## 1. Who alumni are on the platform

| Item | ALP – Pending | ALU – Verified | ALU + Mentor badge |
|---|---|---|---|
| Who | Signed up or claimed a profile, not yet verified | Verified former VIBGYOR student | Verified alumnus approved to guide students |
| How you get here | Join / claim, no automatic match | Exact school-records match, claimed verified profile, Campus Admin approval, or 2 vouches | Accept code of conduct → Campus Admin approves |
| Login | OTP (email / mobile) | OTP (email / mobile) | OTP (email / mobile) |
| Scope | Own profile only | Community: all 39 campuses | Community + consented students |
| Menu | Home · My profile · Alumni directory 🔒 | Home · My profile · Alumni directory · Batch groups · Chats · Jobs · Events · Invite friends · Vouch for batchmates · Become a mentor | Same + **Mentor inbox** · *Mentor badge* |

### What alumni can do

| # | Action | ALP | ALU | Mentor |
|---|---|---|---|---|
| 1 | Join or claim an old-portal profile | ✅ | – | – |
| 2 | Fill in profile (about, work, education, skills, resume, open to) | ✅ | ✅ | ✅ |
| 3 | Set privacy per field, preview as others | ✅ | ✅ | ✅ |
| 4 | Download data / ask for correction / deletion / complaint (*My data*) | ✅ | ✅ | ✅ |
| 5 | Share a vouch link with batchmates | ✅ | – | – |
| 6 | Search the alumni directory, open profiles | 🔒 | ✅ | ✅ |
| 7 | Post and like in batch + campus groups | – | ✅ | ✅ |
| 8 | Direct-message other alumni (Chats) | – | ✅ | ✅ |
| 9 | Browse jobs, mark interest, post a job (campus approves) | – | ✅ | ✅ |
| 10 | RSVP to alumni events (+ guests for reunions), add to calendar | – | ✅ | ✅ |
| 11 | Invite friends by email / WhatsApp | – | ✅ | ✅ |
| 12 | Vouch for pending batchmates | – | ✅ | ✅ |
| 13 | Report a post, profile or job | – | ✅ | ✅ |
| 14 | Request the Mentor badge | – | ✅ | – |
| 15 | Answer students in the Mentor inbox | – | – | ✅ |

### What alumni cannot do

- ❌ See students or parents, or browse them (students only reach mentors, and only through the platform)
- ❌ Share phone, email, links or handles with students (hidden automatically)
- ❌ Meet a student in person or by video outside sessions booked on the platform
- ❌ Change batch or campus (from school records)
- ❌ Post a job that goes live without campus approval
- ❌ Pending alumni: directory, groups, chats, jobs, events (*"This opens as soon as your campus verifies you. You can complete your profile meanwhile."*)

---

## 2. Master flow (end to end)

```mermaid
flowchart TD
    A([Visitor opens /join]) --> B{Claim existing<br/>or sign up new?}
    B -- Claim --> C[Look up by email / mobile<br/>in migrated old-portal records]
    C --> C1{Found?}
    C1 -- No --> B2[Sign up as new]
    C1 -- Yes --> C2[Show profile: batch, campus,<br/>college, work, old status,<br/>engagement history]
    C2 --> OTP
    B -- New --> B2
    B2 --> D[Name · email · mobile · campus ·<br/>pass year · admission no. optional]
    D --> OTP[OTP to email → enter code]
    OTP --> E{Verification check}
    E -- Claimed profile was verified --> V[<b>Alumni – Verified</b><br/>status + history kept]
    E -- Exact match: campus + pass year +<br/>admission no. + name --> V
    E -- Partial / no match --> P[<b>Alumni – Pending</b>]
    P --> P1[Campus Admin compares<br/>side by side in Verification]
    P --> P2[Share vouch link<br/>2 verified batchmates vouch]
    P1 -- Approve --> V
    P1 -- Need info --> P3[WhatsApp: upload school ID /<br/>leaving certificate] --> P1
    P1 -- Reject --> R[WhatsApp with reason]
    P2 -- 2 vouches --> V
    V --> H[Alumni home]
    H --> I[Directory · Groups · Chats ·<br/>Jobs · Events · Invite · Vouch]
    H --> M[Become a mentor]
    M --> M1[Accept 6-point code] --> M2[Campus Admin approves]
    M2 --> M3[<b>Mentor badge</b><br/>visible to consented students]
```

---

## 3. Flow 1: Join or claim a profile

> **Or: invited by the alumni office.** Staff can send a login link from **Alumni records** (email / WhatsApp / SMS). The link opens `/login` with the alumnus's email already filled in; they tap *Send code*, enter the 6-digit code and they're in. No password is ever sent. See [CAD-FLOW.md](CAD-FLOW.md) → *Sending a login link*.

```mermaid
flowchart LR
    S([Start]) --> A[Claim my existing profile]
    S --> B[I'm new here]
    A --> A1[Email or mobile] --> A2{Migrated<br/>record?}
    A2 -- No --> A3["No profile found…<br/>You can sign up as new instead."]
    A2 -- Yes --> A4[Yes, claim this profile<br/>or 'Not me' → sign up]
    B --> B1[Details form]
    A4 --> O[OTP: code to email]
    B1 --> O
    O --> R[Result screen]
```

Steps on screen: **Start → Claim / Details → Found → Verify (OTP) → Result**.

### Verification outcomes

| Outcome | When | What happens |
|---|---|---|
| **Claimed, verified** | Claimed an old-portal profile that was already verified | Verified at once; batch, verified status and engagement history kept |
| **Verified (exact match)** | Campus + pass year + admission no. match a school ERP record, and the name matches | Verified at once: *"Your pass year, admission number and name match school records"* |
| **Pending** | Partial match (e.g. typo in admission no.) or no ERP record (old batches) | Goes to the Campus Admin's **Verification** queue with field-by-field checks; vouch link shown |

Demo fill buttons on the form: *exact match → auto-verified* (Karan Malhotra, 2014), *typo in admission no. → staff queue* (Pooja Reddy, 2019), *2007 batch, no ERP record → queue + peer vouch* (Rahul Desai).

---

## 4. Flow 2: While pending

```mermaid
sequenceDiagram
    autonumber
    actor P as Pending alumnus (Sneha)
    participant S as Platform
    actor B as Verified batchmates
    actor A as Campus Admin

    S-->>P: Home: "Hi Sneha, we're verifying you"<br/>up to 2 working days
    Note over P: ✅ Details submitted<br/>◻ Campus alumni office review<br/>◻ Or: two batchmates vouch (0/2)
    P->>P: Fill in profile while waiting
    P->>B: Share vouch link vaa.vibgyor.in/vouch/<id>
    alt Two batchmates vouch
        B->>S: Vouch (same campus + batch)
        B->>S: Vouch (2nd)
        S-->>P: WhatsApp: two batchmates vouched → verified
    else Campus Admin decides
        A->>S: Approve / Need more info / Reject
        S-->>P: WhatsApp with the result (and reason)
    end
    S-->>P: Role → Alumni – Verified, full menu opens
```

The directory menu item shows a 🔒 until verified.

---

## 5. Flow 3: Alumni home (verified)

```mermaid
flowchart TD
    A([Alumni home]) --> B[Header: Verified alumni · badges<br/>Batch · Campus · Role, Company]
    A --> C{Mentor?}
    C -- Yes --> C1[Mentor inbox<br/>N student conversations · all recorded]
    C -- Request pending --> C2[Mentor request pending]
    C -- No --> C3[Become a mentor]
    A --> D[Vouch for batchmates<br/>N waiting from your batch]
    A --> E[Alumni directory]
    A --> F[Profile N% complete]
    A --> G[Jobs: N live]
    A --> H[Invite friends]
    A --> I[Latest in your groups]
    A --> J[Upcoming events]
    A -. badge suspended .-> K[Red banner: Mentor badge suspended<br/>students can't see you, chats read-only]
```

---

## 6. Flow 4: Profile, privacy and my data

```mermaid
flowchart LR
    A([My profile]) --> T1[Edit profile]
    A --> T2[Privacy]
    A --> T3[Preview as others]
    A --> T4[My data]
    T1 --> E1[About you · headline<br/>Work history · Education after VIBGYOR<br/>Achievements & skills<br/>Resume & open to: hiring, mentoring…]
    T2 --> E2[Per field: All verified alumni /<br/>My batch only / Only me]
    T3 --> E3[View as: another batch ·<br/>a batchmate · a student]
    T4 --> E4[Download JSON · Correct ·<br/>Delete account · Privacy complaint]
```

### Default privacy

| Field | Default | Options |
|---|---|---|
| Email address | Only me | All verified alumni · My batch only · Only me |
| Mobile number | Only me | 〃 |
| Current company | All verified alumni | 〃 |
| City | All verified alumni | 〃 |
| Work history | All verified alumni | 〃 |
| Higher education | All verified alumni | 〃 |

- Batch and campus come from school records and can't be changed.
- **Students and parents never see the directory.** If you're a mentor, students see only name, batch, college, course, current role and short bio, never contact details.
- Campus office staff see the full record; every view is written to the audit log.

---

## 7. Flow 5: Community (directory, groups, chats)

```mermaid
flowchart TD
    A([Alumni directory]) --> B[Search: name, company, college, industry]
    A --> C[Filters: campus · batch · country · field<br/>Quick: hiring · mentors · my batch]
    B & C --> D[Profile card: only fields<br/>the person shares with you]
    D --> E[Open profile<br/>/portal/people/id]
    E --> F[Message → Chats]
    E --> G[Report profile]
    H([Batch groups]) --> H1[Auto-added:<br/>Batch of 2016 · Malad<br/>Malad alumni]
    H1 --> H2[Post · like · report]
    F --> I([Chats: alumni-to-alumni DMs<br/>push notification to the other person])
```

Groups banner: *"You're added automatically to your batch and your campus. Only verified alumni can see these posts."*

---

## 8. Flow 6: Jobs

```mermaid
flowchart LR
    A([Jobs]) --> B[Browse approved jobs<br/>filter by type]
    B --> C[I'm interested + note]
    C --> D[Email to the poster<br/>'reply from your VAA chats']
    A --> E[Post a job]
    E --> F[Title · company · location · type ·<br/>remote · description<br/>☐ Also show to current students]
    F --> G[Contact details in description<br/>hidden automatically]
    G --> H[Status: pending<br/>email: usually within 2 working days]
    H --> I{Campus office}
    I -- Approve --> J[Live · email 'Your job is live']
    I -- Reject --> K[Email 'needs changes'<br/>e.g. personal contact details]
    J --> L[Close job when filled]
    A --> M[Report a job]
```

Jobs marked *Also show to current students* appear on the student **Internships** page; students apply through their career counsellor, never directly.

---

## 9. Flow 7: Events, invites, vouching

```mermaid
flowchart LR
    E([Events]) --> E1[Alumni events: own campus + all campuses]
    E1 --> E2[Going / Maybe / Can't go<br/>reunions: + guests]
    E2 --> E3[WhatsApp / email confirmation<br/>Add to calendar]
    E1 --> E4[Online: Join now<br/>opens 15 min before start ·<br/>Going only · Live now tag]

    I([Invite friends]) --> I1[Email or WhatsApp<br/>link vaa.vibgyor.in/join?ref=me]
    I1 --> I2[Friend joins → still goes through verification]
    I --> I3[Your invites · leaderboard]

    V([Vouch for batchmates]) --> V1[Pending people from<br/>same campus + batch]
    V1 --> V2[Vouch]
    V2 --> V3{2 vouches?}
    V3 -- Yes --> V4[They're verified]
```

---

## 10. Flow 8: Becoming a mentor and the Mentor inbox

```mermaid
sequenceDiagram
    autonumber
    actor A as Alumnus (Rohan)
    participant P as Platform
    actor C as Campus Admin (Meera)
    actor S as Student (consented)

    A->>P: Become a mentor
    P-->>A: 6-point safeguarding code of conduct
    A->>P: Accept code & request badge (+ motivation)
    P->>C: Badge requests queue
    C->>P: Approve
    P-->>A: Mentor badge active
    S->>P: Finds mentor (match by 3C) → asks a question
    P->>A: Mentor inbox (contact details hidden, recorded)
    A->>P: Reply (masked the same way)
    alt Report or masking alert
        P->>C: Safeguarding alert
        C->>P: Suspend badge
        P-->>A: "Your Mentor badge is suspended…"<br/>hidden from students, chats read-only
    end
```

### Safeguarding code of conduct (draft wording)

1. Keep every conversation with students on the platform; never ask for or share phone numbers, emails or social media.
2. All messages with students are recorded and can be read by the campus alumni office and the student's parent, who may also join the conversation.
3. No meeting a student in person or by video outside sessions booked through the platform.
4. Honest guidance; never sell or promote paid services to students.
5. Report anything worrying about a student's safety to the campus alumni office straight away.
6. VIBGYOR can suspend the Mentor badge immediately if the code is broken.

### Mentor inbox rules

| Rule | Detail |
|---|---|
| Who messages first | Only the student starts a conversation |
| What's hidden | Phone, email, links, @handles → `[phone hidden]` etc.; campus notified |
| Read-only when | Student's parent switches off Mentor contact · student account paused · badge suspended |
| Video calls | Not in Release 1 |
| Deleting | Not possible; kept for safeguarding |
| Who else reads | Campus alumni office **and the student's parent**; banner in the inbox says so |
| Parent messages | A parent can **join** the child's conversation; their messages show as *<Name> · <Child>'s parent* and the mentor gets a push. Reply in the same thread |

---

## 11. Status lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Join, no automatic match
    [*] --> Verified: Exact ERP match / claimed verified profile
    Pending --> Verified: Campus Admin approves
    Pending --> Verified: 2 batchmates vouch
    Pending --> InfoRequested: More info requested
    InfoRequested --> Pending: Alumnus replies on home page
    Pending --> Rejected: Campus Admin rejects
    Verified --> MentorRequested: Accepts code, requests badge
    MentorRequested --> Mentor: Campus Admin approves
    MentorRequested --> Verified: Rejected
    Mentor --> Suspended: Campus Admin suspends badge
    Suspended --> Mentor: Reinstated
    Verified --> Deactivated: Staff deactivate / deletion request
```

---

## 12. Gaps and fixes

| # | Item | Status |
|---|---|---|
| 1 | Invites were never marked **Joined** | ✅ **Fixed.** The invite message links to `/join?ref=<inviter>`; on sign-up the matching invite (same email or mobile) is marked joined, or a joined record is added for the inviter. The leaderboard counts it |
| 2 | Pending home didn't change after *More info* or *Reject* | ✅ **Fixed.** *More info*: shows the office's question and a reply box; sending puts the request back in the Verification queue (vouching pauses meanwhile). *Rejected*: shows the reason and what to do next. The pending home also shows the vouch link |
| 3 | Pending alumni or students could open *Vouch for batchmates* or *Become a mentor* by URL | ✅ **Fixed.** Both pages are verified-alumni only, and the store also refuses a vouch unless the voucher is a verified, active alumnus of the same campus and batch, and refuses badge requests from anyone but verified alumni |
| 4 | Deactivated people could still sign in | ✅ **Fixed.** Login says *"This account has been switched off. Please contact your campus alumni office."* |

---

## 13. Quick demo script

1. Open **Join** → **I'm new here** → *Fill an exact match* → OTP → **verified instantly**.
2. Again → *Fill a typo in admission no.* → OTP → **Pending**, vouch link shown.
3. As **Meera** (Campus Admin) → **Verification** → compare fields side by side → **Approve**.
4. As **Rohan** (Malad 2006) → **Vouch for batchmates** → **Sneha** already has 1 of 2 vouches → vouch → she's **verified** (WhatsApp sent). Log in as Sneha to see the full menu.
5. As **Rohan** → **Alumni directory** → filter *my batch* → open a profile → **Message**.
6. **My profile** → **Privacy** → set Company to *My batch only* → **Preview as others** → *Alumni from another batch*: company hidden.
7. **Jobs** → **Post a job** (tick *Also show to current students*) → pending → as Meera, **Jobs & events** → approve.
8. **Become a mentor** → accept code → as Meera approve the badge → as **Diya** (student) the new mentor appears in *Find a mentor*.
