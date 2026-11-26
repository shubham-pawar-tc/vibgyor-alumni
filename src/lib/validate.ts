/**
 * One set of input rules for the whole app.
 * `clean.*` runs on every keystroke and blocks characters that can never be valid.
 * `check.*` returns an error message (or "" when the value is fine) for display and for disabling Submit.
 */

const NAME_CHARS = /[^\p{L}\p{M} .'-]/gu;

export const clean = {
  /** Letters (any language), spaces, dot, apostrophe, hyphen. */
  name: (v: string) => v.replace(NAME_CHARS, "").replace(/\s{2,}/g, " ").slice(0, 80),
  /** Optional leading +, then digits and single spaces. Max 15 digits (E.164). */
  mobile: (v: string) => {
    const plus = v.trimStart().startsWith("+") ? "+" : "";
    const body = v.replace(/[^\d ]/g, "").replace(/\s{2,}/g, " ").trimStart();
    let digits = 0;
    let out = "";
    for (const ch of body) {
      if (/\d/.test(ch)) {
        if (digits >= 15) break;
        digits++;
      }
      out += ch;
    }
    return plus + out;
  },
  /** No spaces; lower case. */
  email: (v: string) => v.replace(/\s/g, "").toLowerCase().slice(0, 120),
  /** Email or mobile in one box (login, invite). */
  emailOrMobile: (v: string) => (/[a-z@]/i.test(v) ? clean.email(v) : clean.mobile(v)),
  digits: (v: string, max = 10) => v.replace(/\D/g, "").slice(0, max),
  /** Admission / roll number: A–Z, 0–9 and hyphens, upper case. */
  admission: (v: string) => v.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20),
  /** Free text in a short field (title, company, city): no control characters, trimmed length. */
  text: (v: string, max = 80) => v.replace(/[\u0000-\u001f<>]/g, "").slice(0, max),
  url: (v: string) => v.replace(/\s/g, "").slice(0, 300),
};

const digitsOf = (v: string) => v.replace(/\D/g, "");

export const check = {
  name: (v: string, label = "Name") => {
    const t = v.trim();
    if (!t) return `${label} is required`;
    if ((t.match(/\p{L}/gu) ?? []).length < 2) return `${label} needs at least 2 letters`;
    if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(t)) return `Use letters, spaces, . ' or - only`;
    return "";
  },
  email: (v: string, required = true) => {
    const t = v.trim();
    if (!t) return required ? "Email is required" : "";
    if (!/^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(t)) return "Enter a valid email, e.g. name@example.com";
    return "";
  },
  /**
   * Indian numbers: 10 digits starting 6–9, with optional +91 / 0 prefix.
   * Other countries: must start with + and country code, 8–15 digits in total.
   */
  mobile: (v: string, required = true) => {
    const t = v.trim();
    if (!t) return required ? "Mobile is required" : "";
    if (/[^\d+ ]/.test(t) || t.lastIndexOf("+") > 0) return "Use digits only, with an optional + at the start";
    const d = digitsOf(t);
    if (t.startsWith("+91") || !t.startsWith("+")) {
      const local = t.startsWith("+91") ? d.slice(2) : d.replace(/^0/, "");
      if (local.length !== 10) return "Indian mobile numbers have 10 digits";
      if (!/^[6-9]/.test(local)) return "Indian mobile numbers start with 6, 7, 8 or 9";
      return "";
    }
    if (d.length < 8 || d.length > 15) return "International numbers: + country code, 8–15 digits";
    return "";
  },
  emailOrMobile: (v: string) => {
    const t = v.trim();
    if (!t) return "Enter your email or mobile";
    return /[a-z@]/i.test(t) ? check.email(t) : check.mobile(t);
  },
  admission: (v: string, required = false) => {
    const t = v.trim();
    if (!t) return required ? "Admission number is required" : "";
    if (!/^[A-Z0-9]+(-[A-Z0-9]+)*$/.test(t) || t.length < 4) return "Use the format on your ID, e.g. VG-MAL-2014-0187";
    return "";
  },
  text: (v: string, label: string, { required = true, min = 2, max = 80 } = {}) => {
    const t = v.trim();
    if (!t) return required ? `${label} is required` : "";
    if (t.length < min) return `${label} is too short`;
    if (t.length > max) return `${label} is too long (max ${max})`;
    if (!/\p{L}/u.test(t)) return `${label} needs some letters`;
    return "";
  },
  url: (v: string, required = true) => {
    const t = v.trim();
    if (!t) return required ? "Link is required" : "";
    if (!/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(t)) return "Enter a full https:// link";
    return "";
  },
  linkedin: (v: string) => {
    const t = v.trim();
    if (!t) return "";
    if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[A-Za-z0-9_-]{2,100}\/?$/i.test(t)) return "Use your profile link, e.g. linkedin.com/in/your-name";
    return "";
  },
  year: (v: string | number, { min = 1950, max = new Date().getFullYear() + 6, required = true, label = "Year" } = {}) => {
    const s = String(v ?? "").trim();
    if (!s) return required ? `${label} is required` : "";
    const n = Number(s);
    if (!/^\d{4}$/.test(s) || n < min || n > max) return `${label} must be between ${min} and ${max}`;
    return "";
  },
  number: (v: string | number, { min = 0, max = Number.MAX_SAFE_INTEGER, label = "Value" } = {}) => {
    const s = String(v ?? "").trim();
    if (!s) return `${label} is required`;
    const n = Number(s);
    if (!Number.isFinite(n) || !/^\d+$/.test(s)) return `${label} must be a whole number`;
    if (n < min) return `${label} must be at least ${min.toLocaleString("en-IN")}`;
    if (n > max) return `${label} can be at most ${max.toLocaleString("en-IN")}`;
    return "";
  },
};

/** Store a mobile in one shape: "+91 98765 43210" for India, "+CC digits" otherwise. */
export function normalizeMobile(v: string) {
  const t = v.trim();
  const d = digitsOf(t);
  if (t.startsWith("+91") || !t.startsWith("+")) {
    const local = t.startsWith("+91") ? d.slice(2) : d.replace(/^0/, "");
    return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : t;
  }
  return t.replace(/\s+/g, " ");
}

/** True when every message is empty. */
export const allOk = (...errors: string[]) => errors.every((e) => !e);

/** Show an error only once the person has typed something (empty required fields just keep Submit disabled). */
export const whenFilled = (v: string | number | undefined, err: string) => (String(v ?? "").trim() ? err : "");
