# Input rules

One set of rules for every form, in `src/lib/validate.ts`. Characters that can never be valid are blocked while typing (`clean.*`); everything else shows a red message under the field once something is typed, and the Save / Submit button stays disabled until all fields pass (`check.*`). Staff accounts and record edits are also checked in the store.

| Field | Rule | Example that passes | Stored as |
|---|---|---|---|
| Name | Letters (any language), spaces, `.` `'` `-`; at least 2 letters | Shubham Pawar, D'Souza | trimmed |
| Email | `name@domain.tld`, no spaces, lower case | srp@gmail.com | lower case |
| Mobile (India) | 10 digits starting 6–9; `+91` or `0` prefix optional; letters can't be typed | 8767201502, +91 87672 01502 | `+91 87672 01502` |
| Mobile (abroad) | Starts with `+` country code, 8–15 digits | +44 7700 900123 | as typed, single spaces |
| Email or mobile (login, claim profile) | Treated as email if it has a letter or `@`, otherwise as mobile | | |
| Admission number | A–Z, 0–9, hyphens, upper case | VG-MAL-2014-0187 | upper case |
| Years (work, education, batch) | 4 digits, sensible range, "To" not before "From" | 2016 | number |
| LinkedIn | `linkedin.com/in/<name>` (https optional) | linkedin.com/in/priya-sharma | trimmed |
| Meeting link | Full `https://` URL | https://meet.google.com/abc-defg-hij | trimmed |
| Event / session time | In the future | | ISO time |
| Donation | Whole rupees, ₹100 – ₹10,00,000 | 2500 | number |
| Short text (title, company, city, venue) | Length limits, must contain letters, no `<` `>` | | trimmed |

Forms covered: Join, Claim profile, Login, Contact (enquiry), Invite, Profile (basics, work, education, 3C), Alumni records edit, Staff, Post a job, New event, Group event, Badge requests and Business listing, Give, MyCareerZ booking, webinar and session time.
