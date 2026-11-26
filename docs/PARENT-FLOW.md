# VIBGYOR Alumni Platform: Parent / Guardian Flow

> Role code **PAR**. Built from the prototype source (`src/components/Homes.tsx` → `ParentHome`, `app/consent/[studentId]/ConsentClient.tsx`, `app/portal/consent/page.tsx`, `components/MyData.tsx`, `app/portal/events/page.tsx`, `components/AppShell.tsx`). Demo personas: **Neha Mehta (`par1`)**, mother of **Aarav Mehta (`stu1`)** and **Riya Mehta (`stu3`)**; **Rohit Mehta (`par3`)**, father and second guardian (see section 12).

---

## 1. What a parent is on the platform

| Item | Detail |
|---|---|
| Who | Parent or legal guardian of a student in Class 8 to 12 |
| Why the role exists | DPDP Act 2023: a minor's account needs **verified parental consent** before it is switched on |
| Sign-up | **None.** The school creates the parent record from ERP data (mobile / email already on file) |
| Login | One-time code (OTP) to the **school-registered** mobile or email. No password |
| Scope | **Own children only** (`childIds`). One parent can have more than one child |
| Menu | **Home** · **Consent centre** · **Mentor chats** · **Events** |

### What a parent can do

| # | Action | Where |
|---|---|---|
| 1 | Receive the consent request (SMS + WhatsApp + email) | Phone / inbox |
| 2 | Verify identity with a 6-digit OTP | `/consent/<studentId>` |
| 3 | Give consent per purpose: **Platform use** (required), **Mentor contact**, **MyCareerZ sharing** | `/consent/<studentId>` |
| 4 | See each child's status and permissions at a glance | `/portal` (Parent home) |
| 5 | Turn any permission on or off later, with immediate effect | `/portal/consent` |
| 6 | See the consent history (who, when, channel, OTP ref, notice version) | `/portal/consent` → History |
| 7 | Download the child's data (text file) | Consent centre → *"<Child>'s data"* card |
| 8 | Ask for a correction, deletion, or raise a privacy complaint | Consent centre → *"<Child>'s data"* card |
| 9 | Browse and RSVP to parent events, add to calendar | `/portal/events` |
| 10 | **Read each child's mentor conversations, join them to message the mentor**, and report a message | `/portal/child-chats` |

### What a parent cannot do

- ❌ See the alumni directory, alumni profiles, batch groups or chats
- ❌ Start a new conversation with a mentor (only the child can; the parent joins the child's existing ones)
- ❌ Message alumni who aren't the child's mentor, or browse alumni
- ❌ See jobs / internships
- ❌ See other students or other families
- Opening any of these pages shows *"Not available for your account"*.

---

## 2. Master flow (end to end)

```mermaid
flowchart TD
    A([School creates student + parent<br/>from ERP records]) --> B[Student account:<br/><b>Locked – awaiting consent</b>]
    B --> C{Student taps<br/>'Ask my parent now'<br/>or school sends reminder}
    C --> D[Parent gets SMS + WhatsApp + email<br/>with consent link /consent/studentId]
    D --> E[Step 1 · Intro<br/>Why consent is needed]
    E --> F[Step 2 · OTP<br/>Code sent to school-registered mobile<br/>expires in 10 min]
    F --> G{OTP correct?}
    G -- No --> F2[Error · Resend code] --> F
    G -- Yes --> H[Step 3 · Choose permissions]
    H --> H1[☑ Platform use · required]
    H --> H2[☐ Mentor contact · optional]
    H --> H3[☐ MyCareerZ sharing · optional]
    H1 & H2 & H3 --> I[Tick 'I am the parent or legal guardian'<br/>→ Confirm my choices]
    I --> J{Platform use<br/>allowed?}
    J -- No --> B
    J -- Yes --> K[Step 4 · Done<br/>Consent recorded:<br/>who · when · notice version · OTP ref]
    K --> L[Student account <b>Active</b><br/>features match consents]
    K --> M[Go to my Parent portal]
    M --> N[Parent home]
    N --> O[Consent centre]
    N --> P[Events]
    O --> Q[Change permissions]
    O --> R[Child's data:<br/>download · correct · delete · complain]
    O --> S[History]
```

---

## 3. Flow 1: Login

```mermaid
flowchart LR
    A([Parent opens /login]) --> B[Choose 'Students & parents']
    B --> C[Enter school-registered<br/>mobile or email]
    C --> D{Found in<br/>school records?}
    D -- No --> E["We couldn't find that email or mobile"]
    D -- Yes --> F[OTP sent by SMS / email]
    F --> G{Code correct?}
    G -- No --> F
    G -- Yes --> H{Any child<br/>awaiting consent?}
    H -- Yes --> I[Parent home shows<br/>'Review consent request']
    H -- No --> J[Parent home shows<br/>'Manage permissions']
```

> Parents never sign up. Callout on login: *"Students and parents don't need to sign up. Your school creates your account from school records."*

---

## 4. Flow 2: Giving consent (student activation)

```mermaid
sequenceDiagram
    autonumber
    actor S as Student (Aarav)
    participant P as Platform
    actor N as Parent (Neha)
    participant A as Campus Admin

    S->>P: Logs in, sees lock screen
    S->>P: Taps "Ask my parent now"
    P->>N: SMS + WhatsApp + email with /consent/stu1
    Note over A,P: Admin can also send reminders<br/>from Student consents tracker
    N->>P: Opens link → Step 1 Intro
    N->>P: "Send code to my mobile"
    P->>N: 6-digit OTP (masked mobile shown, 10 min)
    N->>P: Enters OTP → Step 3 Choose
    N->>P: Platform ✅ · Mentor ✅/❌ · MyCareerZ ✅/❌<br/>+ "I am the parent" → Confirm
    P->>P: Save consent record per purpose<br/>(time, notice version, channel, OTP ref)<br/>+ audit log entry
    P-->>S: Account switches to Active
    P-->>A: Consent tracker updated
    P-->>N: Step 4 Done → "Go to my Parent portal"
```

### What each permission unlocks for the child

| Permission | Required | Child gets | If not given |
|---|---|---|---|
| **Platform use** | ✅ Yes | Sign in, guidance content, events, internships | Account stays **Locked** |
| **Mentor contact** | Optional | *Find a mentor* + safe messaging with Mentor-badged alumni | Mentor pages show "Ask your parent to switch this on" |
| **MyCareerZ sharing** | Optional | Course / country / college preferences sent to MyCareerZ; counsellor contacts the **parent** | Nothing shared |

> Mentor contact and MyCareerZ can only be on when Platform use is on.

---

## 5. Flow 3: Parent home (dashboard)

```mermaid
flowchart TD
    A([Parent home /portal]) --> B[One card per child]
    B --> C[Name · Class · Campus · Status pill<br/>Active / Awaiting consent / Paused / Below age gate]
    C --> D[Permission list:<br/>Platform · Mentor · MyCareerZ<br/>Allowed / Not allowed]
    D --> E{Status?}
    E -- Awaiting consent --> F[Button: Review consent request<br/>→ /consent/studentId]
    E -- Active / Paused --> G[Button: Manage permissions<br/>→ /portal/consent]
    A --> H[Card: How we keep your child safe<br/>• approved mentors only<br/>• all messages recorded & reviewed<br/>• contact details hidden automatically<br/>• no ads or tracking for under-18s]
```

---

## 6. Flow 4: Changing or withdrawing permissions (Consent centre)

```mermaid
flowchart TD
    A([Consent centre /portal/consent]) --> B[Toggle a permission]
    B --> C{Turning ON<br/>or OFF?}
    C -- ON --> D[Modal: Allow this permission?<br/>shows what it means]
    D --> E[Allow] --> F[Granted · recorded · audit log]

    C -- OFF --> G{Which one?}
    G -- Platform use --> H[Modal warns:<br/>account paused straight away,<br/>mentor + MyCareerZ stop too]
    G -- Mentor contact --> I[Modal warns:<br/>mentors hidden,<br/>chats become read-only,<br/>past messages kept for safeguarding]
    G -- MyCareerZ --> J[Modal warns:<br/>sharing stops,<br/>MyCareerZ told to stop using data]
    H & I & J --> K[Withdraw now]
    K --> L[Withdrawn · recorded · audit log]
    L --> M[Effect on child is <b>immediate</b>]
    H --> N[Platform OFF also withdraws<br/>Mentor + MyCareerZ automatically]
    N --> O[Student status → <b>Paused</b>]
```

| Withdrawn | Effect on the child (immediate) |
|---|---|
| Platform use | Account **Paused**; can't sign in; mentor + MyCareerZ also switched off |
| Mentor contact | Mentors disappear from search; existing chats **read-only**; history kept |
| MyCareerZ sharing | No more data sent; MyCareerZ told to stop using data already shared |

Every change shows in **History** with time, channel and OTP reference.

---

## 7. Flow 5: Child's data and privacy requests (DPDP)

```mermaid
flowchart LR
    A([Consent centre →<br/>Child's data card]) --> B[Download data]
    B --> B1[Instant .txt file]
    A --> C[Correct something]
    A --> D[Delete account]
    A --> E[Privacy complaint]
    C & D & E --> F[Request form → Submit]
    F --> G[Email receipt to parent]
    G --> H[Admin: Data requests queue<br/>due within 30 days]
    H --> I{Admin action}
    I -- Start --> J[In progress<br/>visible to parent]
    J --> K[Mark done / Decline]
    I -- Deletion --> L[Name, contact, profile wiped<br/>account off → 'Deleted member']
    K & L --> M[Email reply to parent]
```

---

## 8. Flow 6: Events

```mermaid
flowchart LR
    A([Events /portal/events]) --> B[Upcoming tab:<br/>events open to parents<br/>for child's campus or all campuses]
    B --> C[Open event]
    C --> D{RSVP}
    D --> E[Going / Maybe / Not going]
    E --> F[Add to calendar]
    A --> G[My events tab:<br/>events parent signed up for]
```

Example parent events: *Career talk: commerce after Class 12* (students + parents, Malad), *Studying in the UK: alumni panel* (alumni, students, parents, all campuses).

**Online events: Join now.** Online events (webinars) show a **Join now** button next to the RSVP buttons:

| When | Button |
|---|---|
| More than 15 min before start | Disabled: *Join opens in 2 days 4 h* (counts down by itself) |
| From 15 min before start until the end | **Join now** (green), only if you tapped **Going**; otherwise *Tap "Going" to join* |
| While running | Red **Live now** tag on the card |
| After the end | *Ended* |
| Student without parent consent | Disabled |

Pressing **Join now** records attendance and opens the webinar room link. Students' camera and mic stay off; questions go through moderated chat. Staff see *N joined online* on **Jobs & events**. Demo: a *"Live now: Ask an engineer working abroad"* webinar is created fresh on every demo reset, so Join now can be tried straight away (Diya and Lakshmi are already registered).

---

## 8a. Flow 7: The child's mentor chats (read and join)

Parents can **read** every conversation their child has with an alumni mentor and **join** it to message the mentor themselves. A parent's message goes into the **same conversation**, so the child, the mentor and the campus alumni office all see it. Parents can't start a new conversation; only the child can.

```mermaid
flowchart TD
    A([Mentor chats /portal/child-chats<br/>or Parent home → 'Mentor chats N']) --> B{2+ children?}
    B -- Yes --> C[Child tabs with conversation counts]
    B -- No --> D[Conversation list]
    C --> D
    D --> E[Mentor name · topic · last message ·<br/>'contact details hidden' tag]
    E --> F[Open conversation<br/>Aarav · mentor · You, each labelled]
    F --> G[Audit log: 'Parent viewed mentor conversation']
    F --> H{Can write?}
    H -- Account active + Mentor contact on +<br/>badge active --> I[Type a message<br/>live warning for phone / email / link]
    I --> J[Sent into the same conversation<br/>contact details hidden · auto-flag to campus]
    J --> K[Mentor gets a push:<br/>'New message from Neha Mehta (Aarav's parent)']
    K --> L[Mentor replies in the same thread]
    L --> M[Parent gets a push:<br/>'[Aarav · Class 11] Priya replied…']
    H -- Otherwise --> N[Read-only, with the reason]
    F --> O[Report a message → Campus Safeguarding<br/>'Parent report: …']
```

```mermaid
sequenceDiagram
    autonumber
    actor S as Aarav (student)
    actor N as Neha (parent)
    participant P as Platform
    actor M as Priya (mentor)
    actor C as Campus Admin

    S->>P: Starts a conversation with Priya
    P->>M: Question in Mentor inbox
    M->>P: Replies
    N->>P: Mentor chats → opens Aarav's conversation (logged)
    N->>P: "Thank you! Can you share fee details for Imperial?"
    P->>M: Push: new message from Neha Mehta (Aarav's parent)
    P-->>S: Message appears labelled "Neha Mehta · your parent"
    M->>P: Replies to everyone in the thread
    P->>N: Push: [Aarav · Class 11] Priya replied
    Note over C: Campus Admin sees all three in the transcript<br/>labelled student / parent / mentor
```

| Rule | Detail |
|---|---|
| Where the parent writes | In the child's existing conversation. **Can't start** a new one (only the child can) |
| Who sees a parent's message | The child, the mentor, the campus alumni office (and the other guardian, if they open it) |
| Labels | Parent view: *You* / *Aarav* / mentor name. Student view: *Neha Mehta · your parent*. Mentor view: *Neha Mehta · Aarav's parent*. Campus transcript: *parent* |
| Masking | Same as everyone: phone, email, links, @handles hidden; a masked message raises a safeguarding auto-flag |
| Read-only when | Child's account paused · Mentor contact switched off · mentor badge suspended (same as the child) |
| Notifications | Parent writes → push to the mentor. Mentor writes → push to any parent who has joined that conversation |
| Report | Any message from the mentor or child; goes to Safeguarding as *Parent report* |
| Deleting | Not possible for anyone |
| Logging | Each conversation a parent opens → audit log (*data access*); every message is stored like any other |
| Transparency | Consent text, student banner, mentor banner and mentor code of conduct all say parents can read **and join** |

Demo: log in as **Lakshmi Iyer** (`9819377421`, Diya's mother) → **Mentor chats** → Diya's conversation with Priya → send a message → switch to **Priya**: Mentor inbox shows it labelled *Lakshmi Iyer · Diya's parent* → reply → switch to **Diya**: she sees both. Try typing a phone number as the parent: it's hidden and Meera gets a safeguarding auto-flag.

---

## 8b. Flow 8: MyCareerZ sessions

Menu **MyCareerZ** (tab per child). With MyCareerZ consent ON the parent can **Book and pay ₹2,500** (demo payment); the MyCareerZ counsellor confirms a time and the parent gets a WhatsApp starting `[Child · Class N]`. With consent OFF the page links to the Consent centre. Parents **cannot donate** (Give is closed to them, cond. 15) but can buy services like this.

---

## 9. Student status lifecycle (driven by the parent)

```mermaid
stateDiagram-v2
    [*] --> NotEligible: Below Class 8
    [*] --> Locked: Account created from ERP
    Locked --> Active: Parent gives Platform consent
    Active --> Paused: Parent withdraws Platform consent
    Paused --> Active: Parent allows Platform again
    NotEligible --> Locked: Reaches Class 8 (assumed, not in prototype)
    Active --> [*]: Deletion request completed
```

---

## 10. Data recorded for every consent action

| Field | Example |
|---|---|
| Student | Aarav Mehta (`stu1`) |
| Given by | Neha Mehta (`par1`) |
| Purpose | `platform` / `mentor` / `mcz` |
| Status | granted / withdrawn |
| Time | given at / withdrawn at |
| Channel | SMS / WhatsApp / email |
| OTP reference | e.g. `OTP-xxxx` |
| Notice version | `NOTICE_VERSION` in force at the time |

Also written to the **Audit log** (category `consent`), visible to Campus Admin / Group Alumni Office / Super Admin.

---

## 11. Quick demo script

1. Log in as **Aarav** → **Ask my parent now**.
2. Device simulator → **Open consent link**.
3. **Send code to my mobile** → enter / autofill OTP.
4. Switch on **Talk to approved alumni mentors**, tick **I am Aarav's parent**, **Confirm my choices**.
5. **Go to my Parent portal** → Parent home shows Aarav **Active**.
6. **Consent centre** → switch off **Mentor contact** → **Withdraw now**. Aarav loses mentor access immediately.
7. **Aarav's data** card → **Download data** or raise a request.
8. **Events** → RSVP to a parent event.

Alternate login: `9820045210` or `neha.mehta@example.com` (SMS OTP).

---

## 12. Parent with two (or more) children

> **Note:** All of this section, with its diagram and layout sketch, was added after a review of the multi-child case. **Riya Mehta started as a made-up name for the example.** She has since been added to the demo data as fictional sample student `stu3`, so the case can be shown live.

### 12.1 Demo family

| ID | Name | Role | Detail |
|---|---|---|---|
| `par1` | Neha Mehta | Parent | Mother · `childIds: [stu1, stu3]` |
| `par3` | Rohit Mehta | Parent | Father · **second guardian** · `childIds: [stu1, stu3]` |
| `stu1` | Aarav Mehta | Student | Class 11 · **Malad** (`c01`) · awaiting consent · `parentIds: [par1, par3]` |
| `stu3` | Riya Mehta | Student | Class 8 · **Goregaon West** (`c02`) · awaiting consent · `parentIds: [par1, par3]` |

Event `ev5` *"Class 8 parents: choosing subjects for Class 9"* is open to students and parents at **Goregaon West only**, to show the multi-campus events fix.

### 12.2 What a parent with two children sees

**One login covers every child.** There is no separate account per child and no "pick a child" step.

| Screen | What Neha sees |
|---|---|
| **Login** | One OTP to her school-registered mobile, same as with one child |
| **Parent home** `/portal` | Banner: *"2 of your children are waiting for your permission · Review for Aarav · Review for Riya"*. Then **one card per child** side by side, each with its own status, its own 3 permissions and its own button (*Review consent request for Riya* / *Manage Aarav's permissions*) |
| **Consent link** `/consent/<studentId>?p=<parentId>` | **One link per child, per guardian.** Each needs its own OTP and its own choices. Saying yes for Aarav does **not** switch on Riya |
| **Consent centre** `/portal/consent` | **Child tabs** at the top: `Aarav ● │ Riya ●` (dot = waiting for consent). Only one child shows at a time: *Permissions for Riya*, *Riya's data*, *History for Riya*. Opens on the child named in `?child=`, otherwise the first child who is waiting |
| **Confirm box** | Names the child: *"Withdraw this permission for Riya?"* with Riya's photo, class and campus |
| **Events** | Events for **every child's campus** (Malad + Goregaon West) plus all-campus events. Campus events are tagged *"For Riya's campus"* |
| **Messages** | Every SMS / WhatsApp / email starts with the child's name and class, e.g. `[Riya · Class 8]` |

With one child, the screens look as before (no tabs, no tags).

```mermaid
flowchart TD
    A([Neha logs in once<br/>OTP to school mobile]) --> B[Parent home<br/>banner: 2 children waiting]
    B --> C1[Card: Aarav · Class 11 · Malad<br/>Awaiting consent]
    B --> C2[Card: Riya · Class 8 · Goregaon W<br/>Awaiting consent]
    C1 --> D1[Review consent request for Aarav<br/>→ /consent/stu1?p=par1]
    C2 --> D2[Review consent request for Riya<br/>→ /consent/stu3?p=par1]
    D1 --> E1[OTP → Aarav's permissions → Aarav Active]
    D2 --> E2[OTP → Riya's permissions → Riya Active]
    E1 --> F[Consent centre ?child=stu1]
    E2 --> G[Consent centre ?child=stu3]
    F & G --> T{Tabs: Aarav │ Riya}
    T --> G1[Aarav: permissions · data · history]
    T --> G2[Riya: permissions · data · history]
    B --> H[Events<br/>Malad + Goregaon West + all-campus<br/>tagged 'For Riya's campus']
```

### 12.3 Two guardians (mother and father)

```mermaid
sequenceDiagram
    autonumber
    actor S as Riya (student)
    participant P as Platform
    actor M as Neha (mother)
    actor F as Rohit (father)

    S->>P: Ask my parent now
    P->>M: [Riya · Class 8] SMS + WhatsApp + email<br/>/consent/stu3?p=par1
    P->>F: [Riya · Class 8] SMS + WhatsApp + email<br/>/consent/stu3?p=par3
    F->>P: Opens link → OTP → chooses → confirms
    P-->>S: Account Active
    P->>F: [Riya · Class 8] Thank you, consent recorded
    P->>M: [Riya · Class 8] Rohit Mehta has given consent.<br/>Nothing more is needed from you
    M->>P: Opens her (older) link
    P-->>M: "Consent for Riya already recorded.<br/>Rohit Mehta gave consent …"
    M->>P: Consent centre → withdraws Mentor contact
    P->>F: [Riya · Class 8] Neha Mehta has withdrawn "Mentor contact"
```

- Every guardian on record gets the request. **The first one to verify and confirm counts.**
- Either guardian can change permissions later. Both get a WhatsApp saying who changed what.
- Consent records store **who gave it** (`givenBy`), so the history always says which guardian acted.
- The student lock screen says *"Consent request sent to Neha Mehta and Rohit Mehta"*.
- The admin **Student consents** tracker lists every guardian per student.

### 12.4 Problems found and fixed

| # | Problem | Fix (prototype) | Files |
|---|---|---|---|
| 1 | No demo parent had two children (Neha only had Aarav, Lakshmi only had Diya), so the case couldn't be shown | Added **Riya Mehta** (`stu3`, Class 8, Goregaon West) as Neha's second child. Demo data version bumped to 6, so old browser data resets | `lib/data.ts` |
| 2 | The Consent centre stacked every child on one long page, so it was easy to change the wrong child's permissions | **Child tabs** (with a dot for "waiting"). One child shown at a time; headings and confirm box name the child | `app/portal/consent/page.tsx`, `components/ui.tsx` (`Tabs` dot) |
| 3 | Events used only the parent's own campus, so events at a second child's campus were missed | Events cover **all children's campuses**, tagged *"For Riya's campus"* | `app/portal/events/page.tsx` |
| 4 | Only the first parent on record got the consent link, so a second guardian couldn't give consent | Request goes to **every guardian**; link carries `?p=<parentId>`; first to confirm counts; others are told; added **Rohit Mehta** (`par3`) | `lib/store.tsx`, `app/consent/[studentId]/ConsentClient.tsx`, `components/Homes.tsx`, `app/portal/admin/consents/page.tsx` |
| 5 | Messages to parents didn't name the child clearly | Every consent message starts with `[Child · Class N]` (helper `childTag`) | `lib/utils.ts`, `lib/store.tsx` |

### 12.5 Layout

```
┌─ Parent home ───────────────────────────────────────────────┐
│ Welcome, Neha                                               │
│ ⚠ 2 of your children are waiting for your permission        │
│   Review for Aarav · Review for Riya                        │
│                                                             │
│ ┌ Aarav · Class 11 · Malad ─┐  ┌ Riya · Class 8 · Gor. W ─┐ │
│ │ ● Awaiting consent        │  │ ● Awaiting consent       │ │
│ │ Platform use  Not allowed │  │ Platform use  Not allowed│ │
│ │ Mentor contact Not allowed│  │ Mentor contact Not allowed│ │
│ │ MyCareerZ     Not allowed │  │ MyCareerZ     Not allowed│ │
│ │ [Review … for Aarav]      │  │ [Review … for Riya]      │ │
│ └───────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─ Consent centre ────────────────────────────────────────────┐
│  [ Aarav ● ]  [ Riya ● ]      ← tabs, dot = needs action    │
│  Permissions for Riya · Riya's data · History for Riya      │
└─────────────────────────────────────────────────────────────┘
```

### 12.6 Demo script (two children)

1. Log in as **Neha Mehta** → Parent home shows two cards and the "2 children waiting" banner.
2. **Review consent request for Riya** → OTP → allow Platform use → confirm → lands on Consent centre with the **Riya** tab open.
3. Switch to the **Aarav** tab: Aarav is still waiting. Riya's yes did not switch Aarav on.
4. **Events** → *"Class 8 parents: choosing subjects for Class 9"* (Goregaon West) appears, tagged *"For Riya's campus"*.
5. Log in as **Aarav** → **Ask my parent now** → device simulator shows messages to **both** Neha and Rohit, each starting `[Aarav · Class 11]`.
6. Open **Rohit's** link and consent → Neha gets *"Rohit Mehta has given consent…"*.
