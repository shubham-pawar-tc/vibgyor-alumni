# Annex B coverage in the prototype

What the prototype shows for every row of the **Annex B confirmation (roles, badges and permissions)**, and where to see it. Paths are under `src/`.

> ⚠️ **Read before quoting Annex B.** The Annex says limits are *"enforced server-side in the API and covered by automated tests"*. The prototype is a **browser-only demo**: rules are enforced in the shared store (`lib/store.tsx`) and the screens, there is **no server or API**, and there are **no automated tests** yet. That sentence describes the production build, not this prototype.

## Roles

| Code | Annex B limit | In the prototype | Where |
|---|---|---|---|
| VIS | Public pages, enquiry | ✅ Public home, catalogue info, enquiry form, guided demo | `app/page.tsx`, `app/enquiry` |
| STU | Mentor-badged alumni only (2, 8) | ✅ Find a mentor lists Mentor badge only; masked, logged chats | `portal/mentors`, `portal/messages` |
| STU | Jobs marked for students (10) | ✅ Internships show `forStudents` jobs only; interest goes to the counsellor | `portal/jobs` |
| STU | MyCareerZ only with consent (17) | ✅ *Request a session* refused without the parent's MyCareerZ consent | `portal/careers`, `bookMcz` |
| STU | Exports own data only (22) | ✅ From 18 (by date of birth); under 18 the parent does it | `portal/profile` |
| PAR | Own child only (6) | ✅ Consent centre, Mentor chats, MyCareerZ tabs list own children only | `portal/consent`, `portal/child-chats` |
| PAR | Buys but does not donate (15) | ✅ *Book and pay* MyCareerZ; *Give* is closed to parents (page and store) | `portal/careers`, `portal/give` |
| PAR | Exports child data (23) | ✅ *Your child's data* in Consent centre | `components/MyData.tsx` |
| PAR | Full MyCareerZ booking; controls consents | ✅ | `portal/careers`, `portal/consent` |
| ALP | Edits own profile; may donate (16); exports own data (5); no directory/messaging until verified | ✅ Profile, Give, School documents, My data; directory locked | `portal/profile`, `portal/give` |
| ALU | Jobs only with Recruiter badge (9) | ✅ *Post a job* needs an active Recruiter badge (button and store) | `portal/jobs`, `postJob` |
| ALU | Events, moderation, broadcasts only as Chapter Lead in own group (11, 21) | ✅ Group events, announcements (monthly limit) and post removal only for the group's Chapter Lead | `portal/groups`, `announce`, `removePost`, `createEvent` |
| ALU | Peer vouch (20) | ✅ Same campus + batch, verified, active | `portal/vouch`, `vouch` |
| TCH | Created by Campus Admin; own campus (3); refers to MyCareerZ (18); 2FA | ✅ Campus Admin's **Teachers** page creates them; Student interest, *Refer to MyCareerZ* (needs consent), Engagement log | `portal/teacher/interest`, `portal/admin/staff` |
| CAD | Own campus (3); export reason (24); documents (13); 2FA | ✅ All admin pages scoped; export reason; **Document requests** queue | `portal/admin/*`, `portal/admin/documents` |
| GAO | All campuses; exports with reason (24); campus staff settings (27) | ✅ All campuses; sets the Chapter Lead announcement limit; **Campus staff** page creates Campus Admins and teachers only | `portal/admin/badges`, `portal/admin/staff` |
| FIN | Assigned campuses; document fees (14); finance exports/dashboards (25); refunds and reconciliation (FIN + SAD only) | ✅ Finance page | `portal/finance` |
| MCZ | Assigned campuses; guides (4); consented students (7); webinars (12); bookings (19); own funnel (26); every view logged | ✅ MyCareerZ workspace | `portal/mcz` |
| SAD | All rights; configures matrix but can't loosen §7 | ✅ Permissions page; 🔒 guard-rail cells can't be ticked (page and store) | `portal/admin/permissions`, `HARD_LIMITS` |

## Badges

| Badge | How given | Rights | Where |
|---|---|---|---|
| Mentor | Opt-in + code of conduct + Campus Admin approval | ✅ Student search, messages, instant suspension | `portal/mentor`, Verification, Safeguarding, Badges |
| Chapter Lead | Appointed by Campus Admin or GAO | ✅ Own group: announcements within GAO's monthly limit, group events, remove posts | `portal/admin/badges`, `portal/groups` |
| Recruiter | Request + Campus Admin approval | ✅ Post jobs (moderated), see interest for own posts only; student contacts never shown | `portal/badges`, `portal/jobs` |
| Service Provider | Listing + Campus Admin approval | ✅ Business directory listing; alumni send enquiries (contacts masked) | `portal/badges`, `portal/business` |
| Donor | Automatic after a donation | ✅ Receipts, giving history, opt-in donor wall | `portal/give` |

## Rules

| Rule | In the prototype |
|---|---|
| §5.4 Multiple roles per person | ✅ Linked accounts with **Switch to …** in the account menu (demo: Mrs. Sheryl Fernandes, teacher ↔ alumna). Each account keeps its own rights; the switch is audit-logged |
| §5.4 Role/badge change control | ✅ Badge requests approved in Verification; Badges page suspends instantly, reinstates or removes; staff role changes in *Staff & scopes*; all audit-logged and reversible |

## Not in the prototype (say so if asked)

- Server-side enforcement and automated tests (see warning above)
- Real payment gateway, 80G numbering, Form 10BD
- Mentor guidance videos and mentor bookings (Mentor badge row mentions them)
- Recruiter "applicants": students can't apply directly by design; Recruiters see alumni interest only
