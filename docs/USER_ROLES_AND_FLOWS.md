# VIBGYOR Alumni Platform – Users, Roles, Permissions & Flows

> Generated from the prototype source (`src/lib/data.ts`, `store.tsx`, `AppShell.tsx`, `tours.ts`). All people are **fictional sample data**. Prototype state lives in each visitor's browser.

## 1. Summary

The platform has 10 sign-in roles plus *Visitor* (anyone not signed in).

| Code | Role | Login | Scope |
|---|---|---|---|
| VIS | Visitor | – | Public pages only |
| STU | Student | OTP (account created from school records) | Own account; own campus |
| PAR | Parent / Guardian | OTP on school-registered mobile/email | Own children only |
| ALP | Alumni – Pending | OTP / password | Own profile only |
| ALU | Alumni – Verified | OTP / password | Community (directory, groups, jobs) |
| TCH | Teacher / Counsellor | OTP + 2-factor | Own campus |
| CAD | Campus Admin | OTP + 2-factor | Own campus |
| GAO | Group Alumni Office | OTP + 2-factor | All 39 campuses |
| FIN | Finance & Commerce | OTP + 2-factor | Campuses assigned by Super Admin |
| MCZ | MyCareerZ Counsellor | OTP + 2-factor | Campuses assigned by Super Admin (consented data only) |
| SAD | Super Admin | OTP + 2-factor | All 39 campuses (platform owner) |

## 2. Demo personas (one-click login / Switch role)

| User ID | Name | Role | Used to demo |
|---|---|---|---|
| `stu1` | Aarav Mehta | Student | Class 11 · waiting for parent consent |
| `stu2` | Diya Iyer | Student | Class 12 · consented, can message mentors |
| `par1` | Neha Mehta | Parent / Guardian | Mother of Aarav (Malad) & Riya (Goregaon W) |
| `par3` | Rohit Mehta | Parent / Guardian | Father · second guardian for Aarav & Riya |
| `alu1` | Priya Sharma | Alumni – Verified | Mentor · Imperial College London |
| `alu7` | Rohan Gupta | Alumni – Verified | Verified alumnus · not yet a mentor |
| `alp1` | Sneha Kulkarni | Alumni – Pending | Signed up · awaiting verification |
| `tch1` | Mrs. Sheryl Fernandes | Teacher / Counsellor | Teacher · Malad |
| `cad1` | Meera Joshi | Campus Admin | Campus Admin · Malad (pilot) |
| `gao1` | Sanjay Verma | Group Alumni Office | Group office · all 39 campuses |
| `fin1` | Kavita Rao | Finance & Commerce | Finance · 2 campuses |
| `mcz1` | Aditya Bhatt | MyCareerZ Counsellor | MyCareerZ · 3 campuses |
| `sad1` | Rahul Menon | Super Admin | Platform owner · 2-factor |

## 3. Page access by role

What each role sees in the portal menu. Pages outside a role's list show *"Not available for your account"*.

| Page / feature | VIS | STU | PAR | ALP | ALU | TCH | CAD | GAO | FIN | MCZ | SAD |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Public: Home, Join / claim profile, Login, Enquiry, Guided demo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Portal home / dashboard | – | ✅ | ✅ | ✅ | ✅ | ✅ overview | ✅ | ✅ | ✅ overview | ✅ overview | ✅ |
| My profile | – | ✅ | – | ✅ | ✅ | – | – | – | – | – | – |
| Find a mentor (Mentor-badged alumni only) | – | ✅ ¹ | – | – | – | – | – | – | – | – | – |
| Student–mentor messages | – | ✅ ¹ | ✅ ⁵ | – | ✅ ² | – | – | – | – | – | – |
| Consent centre | – | – | ✅ | – | – | – | – | – | – | – | – |
| Alumni directory & profiles | – | – | – | 🔒 ³ | ✅ | – | ✅ | ✅ | – | – | ✅ |
| Batch groups, Chats (alumni DMs), Invite friends | – | – | – | – | ✅ | – | – | – | – | – | – |
| Jobs / Internships | – | ✅ internships | – | – | ✅ | – | – | – | – | – | – |
| Events | – | ✅ | ✅ | – | ✅ | – | – | – | – | – | – |
| Vouch for batchmates | – | – | – | – | ✅ | – | – | – | – | – | – |
| Become a mentor / Mentor badge | – | – | – | – | ✅ | – | – | – | – | – | – |
| Admin: Verification, Safeguarding, Moderation, Data requests, Jobs & events, Alumni records, Engagement log, Student consents, Broadcasts, Audit log | – | – | – | – | – | – | ✅ | ✅ | – | – | ✅ ⁴ |
| Admin: Duplicates, Master lists | – | – | – | – | – | – | – | ✅ | – | – | ✅ |
| Admin: Badges (suspend / reinstate / appoint Chapter Lead), Document requests | – | – | – | – | – | – | ✅ | ✅ | – | – | ✅ |
| Admin: Staff (CAD → teachers · GAO → CAD + teachers · SAD → everyone) | – | – | – | – | – | – | ✅ | ✅ | – | – | ✅ |
| Admin: Permissions (🔒 guard rails), Settings | – | – | – | – | – | – | – | – | – | – | ✅ |
| My badges, Business directory | – | – | – | – | ✅ | – | – | – | – | – | – |
| Give (donate), School documents | – | – | – | ✅ | ✅ | – | – | – | – | – | – |
| MyCareerZ sessions (student requests · parent books and pays) | – | ✅ | ✅ | – | – | – | – | – | – | – | – |
| Finance | – | – | – | – | – | – | – | – | ✅ | – | ✅ |
| MyCareerZ workspace | – | – | – | – | – | – | – | – | – | ✅ | – |
| Student interest (internship inbox) | – | – | – | – | – | ✅ own campus | – | – | – | – | – |

1. Only after a parent consents (platform use; mentor contact for messaging). Locked/paused students see a lock screen.
2. *Mentor inbox* – only alumni holding an active Mentor badge.
3. Pending alumni see the menu item but it stays locked until verified.
4. Pages open for SAD, but actions follow the capability matrix below (e.g. SAD cannot approve verifications, read chats or send broadcasts by default; those buttons show *"Your role can't …"*). Admin pages refuse non-staff with *"Staff only"*; the Engagement log also allows TCH (own campus).
5. *Mentor chats* – parents read their own children's conversations, can join them to message the mentor (can't start new ones), and can report a message; each view is logged.

TCH, FIN and MCZ have working pages (Student interest + Engagement log; Finance; MyCareerZ). Full Annex B mapping: [ANNEX-B-COVERAGE.md](ANNEX-B-COVERAGE.md). Super Admin assigns each staff member's campuses in *Staff & scopes*:

- **TCH** – student 3C preferences, mentor match suggestions, career talk requests, campus events. Own campus only; can't broadcast or export.
- **FIN** – payments, 80G receipts & Form 10BD, refunds, reconciliation (Release 3). No directory or student data.
- **MCZ** – consented student leads, opted-in alumni guides, funnel reports. Consented records and agreed fields only; stops when consent is withdrawn.

## 4. Admin capability matrix (RFQ A6)

Default permissions for staff roles. The Super Admin can change these live on **Admin → Permissions**; every change is written to the audit log.

| Capability | TCH | CAD | GAO | FIN | MCZ | SAD |
|---|---|---|---|---|---|---|
| View alumni records (`records.view`) | – | ✅ | ✅ | – | – | ✅ |
| Edit or deactivate alumni records (`records.edit`) | – | ✅ | ✅ | – | – | ✅ |
| Export data (with a reason) (`records.export`) | – | ✅ | ✅ | – | – | ✅ |
| Approve alumni verification (`verify`) | – | ✅ | ✅ | – | – | – |
| Read student–mentor chats (`chats.read`) | – | ✅ | ✅ | – | – | – |
| Send broadcasts (`broadcast.send`) | – | ✅ | ✅ | – | – | – |
| Moderate reported content (`content.moderate`) | – | ✅ | ✅ | – | – | ✅ |
| Merge duplicate records (`duplicates.merge`) | – | – | ✅ | – | – | ✅ |
| Edit master lists (`masters.edit`) | – | – | ✅ | – | – | ✅ |
| Handle data & privacy requests (`requests.handle`) | – | ✅ | ✅ | – | – | ✅ |
| Log alumni interactions (`engagement.log`) | ✅ | ✅ | ✅ | – | – | – |

**Scope rule:** CAD acts only on its own campus; GAO and SAD act on all 39 campuses.

## 5. Key flows

### 5.1 Parent consent (student activation)
*Actors: STU → PAR*

1. School creates the student account from ERP records; status **Locked – awaiting parent consent**. Students below the campus age gate (default Class 8, set in Settings) are never invited and see *"Not open for your class yet"*.
2. **Every guardian on record** receives SMS/WhatsApp/email with a consent link (`/consent/<studentId>?p=<parentId>`). Each message starts with the child's name and class, e.g. `[Riya · Class 8]`.
3. Parent verifies with a 6-digit OTP on the school-registered mobile.
4. Parent chooses purposes: **Platform use** (required), **Mentor contact**, **MyCareerZ sharing** (optional). The first guardian to confirm counts; the other guardian is told nothing more is needed.
5. Student account switches on; allowed features match the consents given.
6. Either guardian can withdraw any consent in the **Consent centre**; the student account pauses immediately if platform consent is withdrawn. Both guardians are told who changed what.
7. A parent with several children signs in once: one card per child on Parent home, child tabs in the Consent centre, and events for every child's campus. Consent is given separately for each child.
8. Parents can read each child's mentor conversations under **Mentor chats**, join them to message the mentor in the same thread (child and campus see it), and report any message. Students and mentors are told parents can read and join.

### 5.2 Student asks a mentor (safe messaging)
*Actors: STU → ALU (Mentor) → CAD*

1. Consented student opens **Find a mentor** and sees only Mentor-badged alumni.
2. Student sends a message; phone numbers, emails, links and handles are masked automatically.
3. Every student–mentor message is recorded and cannot be deleted.
4. Masking or a user report raises a **Safeguarding** alert for the Campus Admin.
5. Campus Admin reviews the chat and can suspend the mentor's badge instantly.

### 5.3 Alumni joins / claims profile
*Actors: VIS → ALP/ALU → CAD / peers*

1. Visitor opens **Join** and either claims an old-portal profile (email/mobile lookup) or signs up new.
2. Email OTP confirms identity.
3. Exact match on pass year + admission no. + name against school records → **Alumni – Verified** instantly.
4. Partial match → **Alumni – Pending**; Campus Admin compares details side by side in **Verification** and approves, asks for more info (the alumnus replies from their home page and the request returns to the queue) or rejects (reason shown on their home page).
5. Old batches without digital records: two verified batchmates **vouch** to verify.

### 5.4 Becoming a mentor
*Actors: ALU → CAD*

1. Verified alumnus opens **Become a mentor** and accepts the safeguarding code of conduct (CS-9; acceptance recorded).
2. Request goes to the Campus Admin's **Badge requests** queue (RFQ §5.2: alumnus opts in, Campus Admin approves).
3. On approval the Mentor badge is active and the alumnus appears to consented students.
4. Campus Admin can suspend the badge instantly.

### 5.5 School broadcast
*Actors: CAD / GAO*

1. Campus Admin starts a message, chooses audience (batch, campus, city…) and channels (email, WhatsApp, SMS, push).
2. Preview shows recipient count and opt-out handling, then send.
3. Group Alumni Office can target all campuses.

### 5.6 Alumni community
*Actors: ALU*

1. Auto-added to batch and campus groups; post and read updates.
2. Search the directory (privacy settings respected), open profiles, start DMs.
3. Post/apply for jobs (jobs need admin approval), RSVP to events, invite batchmates.

### 5.7 Governance
*Actors: CAD / GAO / SAD*

1. Moderation queue for reported posts, profiles and jobs (24-hour target).
2. Data & privacy requests (access, correction, deletion, complaint) with a 30-day due date.
3. Duplicate merge and master-list mapping (GAO/SAD).
4. Audit log of every admin action; Super Admin edits the permission matrix and settings.

## 6. Full user list

### Student (STU) – 14

| ID | Name | Campus | Class | Status |
|---|---|---|---|---|
| `stu1` | Aarav Mehta | Malad, Mumbai | 11 | Locked – awaiting parent consent · parents Neha & Rohit |
| `stu2` | Diya Iyer | Malad, Mumbai | 12 | Active (parent consented) |
| `stu3` | Riya Mehta | Goregaon West, Mumbai | 8 | Locked – awaiting parent consent · Aarav's sister |
| `stuR1` | Ishita Rane | Malad, Mumbai | 12 | Active (parent consented) |
| `stuR2` | Kunal Shah | Malad, Mumbai | 10 | Locked – awaiting parent consent |
| `stuR3` | Zara Sheikh | Malad, Mumbai | 9 | Active (parent consented) |
| `stuR4` | Om Patil | Malad, Mumbai | 11 | Locked – awaiting parent consent |
| `stuR5` | Tara D'Souza | Malad, Mumbai | 8 | Active (parent consented) |
| `stuR6` | Vihaan Agarwal | Malad, Mumbai | 12 | Paused – parent withdrew consent |
| `stuR7` | Myra Bansal | Malad, Mumbai | 10 | Active (parent consented) |
| `stuR8` | Reyansh Kulkarni | Malad, Mumbai | 9 | Locked – awaiting parent consent |
| `stuR9` | Anika Joshi | Malad, Mumbai | 11 | Active (parent consented) |
| `stuR10` | Aditya Rao | Malad, Mumbai | 8 | Locked – awaiting parent consent |
| `stuR11` | Advait Kamat | Malad, Mumbai | 7 | Not eligible (below Class 8) |

### Parent / Guardian (PAR) – 13

| ID | Name | Campus scope | Notes |
|---|---|---|---|
| `par1` | Neha Mehta | Malad, Mumbai | Mother of Aarav (`stu1`) & Riya (`stu3`) |
| `par2` | Lakshmi Iyer | Malad, Mumbai | Diya's mother |
| `par3` | Rohit Mehta | Malad, Mumbai | Father of Aarav & Riya · second guardian |
| `parR1` | Rakesh Rane | Malad, Mumbai |  |
| `parR2` | Sunita Shah | Malad, Mumbai |  |
| `parR3` | Farhan Sheikh | Malad, Mumbai |  |
| `parR4` | Pooja Patil | Malad, Mumbai |  |
| `parR5` | Anil D'Souza | Malad, Mumbai |  |
| `parR6` | Ritu Agarwal | Malad, Mumbai |  |
| `parR7` | Sanjeev Bansal | Malad, Mumbai |  |
| `parR8` | Deepa Kulkarni | Malad, Mumbai |  |
| `parR9` | Manoj Joshi | Malad, Mumbai |  |
| `parR10` | Kiran Rao | Malad, Mumbai |  |

### Alumni – Pending (ALP) – 3

| ID | Name | Campus | Batch | Badges | Notes |
|---|---|---|---|---|---|
| `alp1` | Sneha Kulkarni | Malad, Mumbai | 2006 | – | Signed up · awaiting verification |
| `alp2` | Imran Shaikh | Malad, Mumbai | 2015 | – |  |
| `alp3` | Fatima Ansari | Goregaon West, Mumbai | 2016 | – |  |

### Alumni – Verified (ALU) – 38

| ID | Name | Campus | Batch | Badges | Notes |
|---|---|---|---|---|---|
| `alu1` | Priya Sharma | Malad, Mumbai | 2016 | Mentor | Mentor · Imperial College London |
| `alu2` | Kabir Rao | Goregaon West, Mumbai | 2014 | Mentor |  |
| `alu3` | Dr. Ananya Desai | Kharadi, Pune | 2017 | Mentor |  |
| `alu4` | Rhea Kapoor | Harlur, Bengaluru | 2015 | Mentor |  |
| `alu5` | Arjun Nair | Malad, Mumbai | 2013 | Mentor |  |
| `alu6` | Vikram Singh | Kondapur, Hyderabad | 2012 | Mentor |  |
| `alu8` | Meghna Pillai | Goregaon East, Mumbai | 2018 | Mentor |  |
| `alu9` | Sameer Khan | Thane, Mumbai | 2015 | Mentor |  |
| `alu7` | Rohan Gupta | Malad, Mumbai | 2006 | – | Verified alumnus · not yet a mentor |
| `aluX1` | Nikita Sawant | Malad, Mumbai | 2020 | – |  |
| `aluX2` | Siddharth Jain | Kharadi, Pune | 2018 | – |  |
| `aluX3` | Ishaan Bose | Malad, Mumbai | 2017 | – |  |
| `dir1` | Aditi Bhatia | Malad, Mumbai | 2016 | – |  |
| `dir2` | Rahul Menon | Malad, Mumbai | 2016 | – |  |
| `dir3` | Simran Chopra | Malad, Mumbai | 2006 | – |  |
| `dir4` | Nikhil Deshpande | Malad, Mumbai | 2006 | – |  |
| `dir5` | Farah Ansari | Malad, Mumbai | 2013 | – |  |
| `dir6` | Kunal Sethi | Malad, Mumbai | 2016 | – |  |
| `dir7` | Isha Malhotra | Malad, Mumbai | 2012 | – |  |
| `dir8` | Varun Iyer | Malad, Mumbai | 2018 | – |  |
| `dir9` | Ananya Banerjee | Goregaon West, Mumbai | 2011 | – |  |
| `dir10` | Siddharth Reddy | Goregaon West, Mumbai | 2013 | – |  |
| `dir11` | Pooja Gokhale | Goregaon East, Mumbai | 2014 | – |  |
| `dir12` | Aman Verma | Goregaon East, Mumbai | 2008 | – |  |
| `dir13` | Tanvi Saxena | Kandivali, Mumbai | 2021 | – |  |
| `dir14` | Yash Shetty | Thane, Mumbai | 2021 | – |  |
| `dir15` | Nandini Rao | Airoli, Navi Mumbai | 2015 | – |  |
| `dir16` | Harsh Thakur | Dahisar, Mumbai | 2012 | – |  |
| `dir17` | Sara Fernandes | Kharadi, Pune | 2013 | – |  |
| `dir18` | Dev Mistry | Balewadi, Pune | 2023 | – |  |
| `dir19` | Ritika Ghosh | Malad, Mumbai | 2013 | – |  |
| `dir20` | Omkar Pawar | Malad, Mumbai | 2014 | – |  |
| `dir21` | Shreya Naidu | Goregaon West, Mumbai | 2018 | – |  |
| `dir22` | Kartik Jain | Harlur, Bengaluru | 2024 | – |  |
| `dir23` | Mihika Kale | Malad, Mumbai | 2022 | – |  |
| `dir24` | Neil D'Costa | Goregaon East, Mumbai | 2012 | – |  |
| `dup1` | Aditi S. Bhatia | Malad, Mumbai | 2016 | – |  |
| `dup2` | Nikhil Deshpandey | Malad, Mumbai | 2006 | – |  |

### Teacher / Counsellor (TCH) – 1

| ID | Name | Campus scope | Notes |
|---|---|---|---|
| `tch1` | Mrs. Sheryl Fernandes | Malad, Mumbai | Teacher · Malad |

### Campus Admin (CAD) – 1

| ID | Name | Campus scope | Notes |
|---|---|---|---|
| `cad1` | Meera Joshi | Malad, Mumbai | Campus Admin · Malad (pilot) |

### Group Alumni Office (GAO) – 1

| ID | Name | Campus scope | Notes |
|---|---|---|---|
| `gao1` | Sanjay Verma | All 39 campuses | Group office · all 39 campuses |

### Finance & Commerce (FIN) – 1

| ID | Name | Campus scope | Notes |
|---|---|---|---|
| `fin1` | Kavita Rao | Malad, Mumbai; Goregaon West, Mumbai | Finance · 2 campuses |

### MyCareerZ Counsellor (MCZ) – 1

| ID | Name | Campus scope | Notes |
|---|---|---|---|
| `mcz1` | Aditya Bhatt | Malad, Mumbai; Goregaon West, Mumbai; Goregaon East, Mumbai | MyCareerZ · 3 campuses |

### Super Admin (SAD) – 1

| ID | Name | Campus scope | Notes |
|---|---|---|---|
| `sad1` | Rahul Menon | All 39 campuses | Platform owner · 2-factor |
