import type {
  Capability,
  DataRequest,
  EngagementEntry,
  MasterItem,
  MasterKind,
  AlumniProfile,
  DmMessage,
  DmThread,
  GroupPost,
  Invite,
  Job,
  PrivateField,
  VaaEvent,
  Visibility,
  AuditEntry,
  Campus,
  Consent,
  Conversation,
  Message,
  Report,
  Role,
  State,
  User,
  VerificationRequest,
  BadgeRequest,
} from "./types";

/* ------------------------------------------------------------------
   Sample data only. Campus names, people and numbers are illustrative.
------------------------------------------------------------------- */

const campusList: [string, string][] = [
  ["Malad", "Mumbai"],
  ["Goregaon West", "Mumbai"],
  ["Goregaon East", "Mumbai"],
  ["Kandivali", "Mumbai"],
  ["Thane", "Mumbai"],
  ["Airoli", "Navi Mumbai"],
  ["Dahisar", "Mumbai"],
  ["Borivali", "Mumbai"],
  ["Chembur", "Mumbai"],
  ["Kharghar", "Navi Mumbai"],
  ["Kharadi", "Pune"],
  ["Balewadi", "Pune"],
  ["NIBM Road", "Pune"],
  ["Hadapsar", "Pune"],
  ["Yerwada", "Pune"],
  ["Pimple Saudagar", "Pune"],
  ["Harlur", "Bengaluru"],
  ["Yelahanka", "Bengaluru"],
  ["Marathahalli", "Bengaluru"],
  ["Bannerghatta Road", "Bengaluru"],
  ["Electronic City", "Bengaluru"],
  ["Hebbal", "Bengaluru"],
  ["Kundalahalli", "Bengaluru"],
  ["Whitefield", "Bengaluru"],
  ["Kondapur", "Hyderabad"],
  ["Gachibowli", "Hyderabad"],
  ["Kompally", "Hyderabad"],
  ["Gotri", "Vadodara"],
  ["Manjalpur", "Vadodara"],
  ["Gomti Nagar", "Lucknow"],
  ["Rajarhat", "Kolkata"],
  ["OMR", "Chennai"],
  ["Saravanampatti", "Coimbatore"],
  ["Wardha Road", "Nagpur"],
  ["Gangapur Road", "Nashik"],
  ["Vesu", "Surat"],
  ["Nipania", "Indore"],
  ["Bopal", "Ahmedabad"],
  ["Mira Road", "Mumbai"],
];

export const campuses: Campus[] = campusList.map(([name, city], i) => ({
  id: `c${String(i + 1).padStart(2, "0")}`,
  name,
  city,
}));

export const campusById = (id: string) => campuses.find((c) => c.id === id);
export const campusName = (id?: string) => {
  const c = id ? campusById(id) : undefined;
  return c ? `${c.name}, ${c.city}` : "—";
};

export const roleLabels: Record<Role, string> = {
  VIS: "Visitor",
  STU: "Student",
  PAR: "Parent / Guardian",
  ALP: "Alumni – Pending",
  ALU: "Alumni – Verified",
  TCH: "Teacher / Counsellor",
  CAD: "Campus Admin",
  GAO: "Group Alumni Office",
  FIN: "Finance & Commerce",
  MCZ: "MyCareerZ Counsellor",
  SAD: "Super Admin",
};

export const STAFF_ROLES: Role[] = ["TCH", "CAD", "GAO", "FIN", "MCZ", "SAD"];

export const NOTICE_VERSION = "v1.0 (draft – wording to be supplied by VIBGYOR)";

export const consentPurposes = {
  platform: {
    title: "Use the VIBGYOR Alumni Platform",
    short: "Platform use",
    required: true,
    body: "Create your child's student account from school records (name, class, campus) so they can see guidance content and events. Without this, the account stays switched off.",
  },
  mentor: {
    title: "Talk to approved alumni mentors",
    short: "Mentor contact",
    required: false,
    body: "Let your child message alumni who hold the Mentor badge and have signed VIBGYOR's safeguarding code. Every message is recorded and visible to the campus alumni office and to you: you can read your child's mentor conversations and join them to message the mentor yourself, from your Parent portal. Phone numbers or emails are hidden automatically.",
  },
  mcz: {
    title: "Share career preferences with MyCareerZ",
    short: "MyCareerZ sharing",
    required: false,
    body: "Send your child's course, country and college preferences and any enquiry to MyCareerZ, VIBGYOR's career-counselling service, so a counsellor can contact you (the parent). No advertising is shown to your child.",
  },
} as const;

/* ------------------------------ People ------------------------------ */

const T0 = "2026-11-20T09:00:00.000Z";
const ago = (hours: number) => new Date(Date.parse("2026-11-25T10:00:00.000Z") - hours * 3600_000).toISOString();

const mentor = (since: string) => [{ type: "Mentor" as const, status: "active" as const, since }];

export const seedUsers: User[] = [
  // Students
  {
    id: "stu1",
    name: "Aarav Mehta",
    role: "STU",
    campusIds: ["c01"],
    email: "aarav.mehta@student.example.in",
    mobile: "—",
    className: 11,
    studentStatus: "awaiting_consent",
    parentIds: ["par1", "par3"],
    dob: "2010-03-14",
    threeC: [
      { country: "United Kingdom", course: "Computer Science", college: "Imperial College London" },
      { country: "Canada", course: "Computer Science", college: "University of Toronto" },
      { country: "India", course: "Computer Science", college: "IIT Bombay" },
    ],
    interests: ["Artificial intelligence", "Robotics", "Debating"],
  },
  {
    id: "stu2",
    name: "Diya Iyer",
    role: "STU",
    campusIds: ["c01"],
    email: "diya.iyer@student.example.in",
    mobile: "—",
    className: 12,
    studentStatus: "active",
    parentIds: ["par2"],
    dob: "2009-07-02",
    threeC: [
      { country: "India", course: "Medicine (MBBS)", college: "Kasturba Medical College" },
      { country: "Australia", course: "Psychology", college: "University of Melbourne" },
      { country: "India", course: "Biotechnology", college: "Christ University" },
    ],
    interests: ["Biology olympiad", "Volunteering", "Classical dance"],
  },
  {
    // Aarav's younger sister, on a different campus: demos a parent with two children
    id: "stu3",
    name: "Riya Mehta",
    role: "STU",
    campusIds: ["c02"],
    email: "riya.mehta@student.example.in",
    mobile: "—",
    className: 8,
    studentStatus: "awaiting_consent",
    parentIds: ["par1", "par3"],
    dob: "2013-01-22",
    interests: ["Art", "Swimming"],
  },
  // Parents
  {
    id: "par1",
    name: "Neha Mehta",
    role: "PAR",
    campusIds: ["c01"],
    email: "neha.mehta@example.com",
    mobile: "+91 98200 45210",
    childIds: ["stu1", "stu3"],
  },
  {
    // Second guardian for Aarav and Riya: either parent can give consent
    id: "par3",
    name: "Rohit Mehta",
    role: "PAR",
    campusIds: ["c01"],
    email: "rohit.mehta@example.com",
    mobile: "+91 98201 33876",
    childIds: ["stu1", "stu3"],
  },
  {
    id: "par2",
    name: "Lakshmi Iyer",
    role: "PAR",
    campusIds: ["c01"],
    email: "lakshmi.iyer@example.com",
    mobile: "+91 98193 77421",
    childIds: ["stu2"],
  },
  // Mentors (Alumni – Verified + Mentor badge)
  {
    id: "alu1",
    name: "Priya Sharma",
    role: "ALU",
    campusIds: ["c01"],
    email: "priya.sharma@example.com",
    mobile: "+44 7700 900123",
    batch: 2016,
    college: "Imperial College London",
    country: "United Kingdom",
    course: "Computer Science",
    field: "Software engineering",
    company: "Google",
    title: "Software Engineer",
    city: "London",
    bio: "MEng Computing at Imperial. Happy to talk about UCAS personal statements, the MAT/TMUA tests and life in London.",
    badges: mentor("2025-08-12T00:00:00.000Z"),
    codeOfConductAcceptedAt: "2025-08-10T00:00:00.000Z",
  },
  {
    id: "alu2",
    name: "Kabir Rao",
    role: "ALU",
    campusIds: ["c02"],
    email: "kabir.rao@example.com",
    mobile: "+1 416 555 0182",
    batch: 2014,
    college: "University of Toronto",
    country: "Canada",
    course: "Computer Science",
    field: "Data science",
    company: "Shopify",
    title: "Senior Data Scientist",
    city: "Toronto",
    bio: "BSc CS + Statistics at UofT. Ask me about co-op programmes, study permits and scholarships in Canada.",
    badges: mentor("2025-06-01T00:00:00.000Z"),
    codeOfConductAcceptedAt: "2025-05-30T00:00:00.000Z",
  },
  {
    id: "alu3",
    name: "Dr. Ananya Desai",
    role: "ALU",
    campusIds: ["c11"],
    email: "ananya.desai@example.com",
    mobile: "+91 99870 11223",
    batch: 2017,
    college: "Kasturba Medical College",
    country: "India",
    course: "Medicine (MBBS)",
    field: "Healthcare",
    company: "Manipal Hospitals",
    title: "Resident Doctor",
    city: "Bengaluru",
    bio: "MBBS from KMC Manipal. I can help with NEET preparation, choosing a medical college and what residency is really like.",
    badges: mentor("2025-09-20T00:00:00.000Z"),
    codeOfConductAcceptedAt: "2025-09-18T00:00:00.000Z",
  },
  {
    id: "alu4",
    name: "Rhea Kapoor",
    role: "ALU",
    campusIds: ["c17"],
    email: "rhea.kapoor@example.com",
    mobile: "+91 98450 66231",
    batch: 2015,
    college: "National Institute of Design",
    country: "India",
    course: "Design",
    field: "Product design",
    company: "Swiggy",
    title: "Lead Product Designer",
    city: "Bengaluru",
    bio: "NID Ahmedabad graduate. Portfolio reviews, NID/UCEED prep and careers in UX.",
    badges: mentor("2025-03-11T00:00:00.000Z"),
    codeOfConductAcceptedAt: "2025-03-10T00:00:00.000Z",
  },
  {
    id: "alu5",
    name: "Arjun Nair",
    role: "ALU",
    campusIds: ["c01"],
    email: "arjun.nair@example.com",
    mobile: "+91 98670 22119",
    batch: 2013,
    college: "Shri Ram College of Commerce",
    country: "India",
    course: "Commerce & Economics",
    field: "Finance",
    company: "Deloitte",
    title: "Chartered Accountant, Manager",
    city: "Mumbai",
    bio: "SRCC → CA. Talk to me about CUET, commerce streams and the CA route.",
    badges: mentor("2024-11-02T00:00:00.000Z"),
    codeOfConductAcceptedAt: "2024-11-01T00:00:00.000Z",
  },
  {
    id: "alu6",
    name: "Vikram Singh",
    role: "ALU",
    campusIds: ["c25"],
    email: "vikram.singh@example.com",
    mobile: "+91 90000 33442",
    batch: 2012,
    college: "IIT Bombay",
    country: "India",
    course: "Mechanical Engineering",
    field: "Entrepreneurship",
    company: "VoltRide (founder)",
    title: "Co-founder & CEO",
    city: "Hyderabad",
    bio: "IIT Bombay mechanical. Building EVs. JEE strategy and starting up after engineering.",
    badges: mentor("2025-01-15T00:00:00.000Z"),
    codeOfConductAcceptedAt: "2025-01-14T00:00:00.000Z",
  },
  {
    id: "alu8",
    name: "Meghna Pillai",
    role: "ALU",
    campusIds: ["c03"],
    email: "meghna.pillai@example.com",
    mobile: "+61 400 555 019",
    batch: 2018,
    college: "University of Melbourne",
    country: "Australia",
    course: "Psychology",
    field: "Research",
    company: "University of Melbourne",
    title: "Research Assistant",
    city: "Melbourne",
    bio: "Psychology at Melbourne. Ask me about studying in Australia and psychology careers.",
    badges: mentor("2025-10-05T00:00:00.000Z"),
    codeOfConductAcceptedAt: "2025-10-04T00:00:00.000Z",
  },
  {
    id: "alu9",
    name: "Sameer Khan",
    role: "ALU",
    campusIds: ["c05"],
    email: "sameer.khan@example.com",
    mobile: "+1 206 555 0147",
    batch: 2015,
    college: "Carnegie Mellon University",
    country: "United States",
    course: "Computer Science",
    field: "Machine learning",
    company: "Microsoft",
    title: "ML Engineer",
    city: "Seattle",
    bio: "CMU MS in ML. US applications, SAT/AP planning and research internships.",
    badges: mentor("2025-04-22T00:00:00.000Z"),
    codeOfConductAcceptedAt: "2025-04-21T00:00:00.000Z",
  },
  // Verified alumnus, not a mentor (to demo mentor opt-in and peer vouch)
  {
    id: "alu7",
    name: "Rohan Gupta",
    role: "ALU",
    campusIds: ["c01"],
    email: "rohan.gupta@example.com",
    mobile: "+91 98450 12007",
    batch: 2006,
    college: "Narsee Monjee College",
    country: "India",
    course: "Management",
    field: "Product management",
    company: "Flipkart",
    title: "Director, Product",
    city: "Bengaluru",
    badges: [],
  },
  // Alumni – Pending
  {
    id: "alp1",
    name: "Sneha Kulkarni",
    role: "ALP",
    campusIds: ["c01"],
    email: "sneha.kulkarni@example.com",
    mobile: "+971 50 555 0192",
    batch: 2006,
    city: "Dubai",
  },
  // Staff
  {
    id: "tch1",
    name: "Mrs. Sheryl Fernandes",
    role: "TCH",
    campusIds: ["c01"],
    email: "sheryl.fernandes@vibgyor.example",
    mobile: "+91 98200 00011",
    title: "Career Counsellor",
  },
  {
    id: "cad1",
    name: "Meera Joshi",
    role: "CAD",
    campusIds: ["c01"],
    email: "meera.joshi@vibgyor.example",
    mobile: "+91 98200 00021",
    title: "Alumni Coordinator, Malad",
  },
  {
    id: "gao1",
    name: "Sanjay Verma",
    role: "GAO",
    campusIds: campuses.map((c) => c.id),
    email: "sanjay.verma@vibgyor.example",
    mobile: "+91 98200 00031",
    title: "Head, VIBGYOR Alumni Association",
  },
  {
    id: "fin1",
    name: "Kavita Rao",
    role: "FIN",
    campusIds: ["c01", "c02"],
    email: "kavita.rao@vibgyor.example",
    mobile: "+91 98200 00041",
    title: "Accounts Manager",
  },
  {
    id: "mcz1",
    name: "Aditya Bhatt",
    role: "MCZ",
    campusIds: ["c01", "c02", "c03"],
    email: "aditya.bhatt@mycareerz.example",
    mobile: "+91 98200 00051",
    title: "Senior Counsellor, MyCareerZ",
  },
  {
    id: "sad1",
    name: "Rahul Menon",
    role: "SAD",
    campusIds: campuses.map((c) => c.id),
    email: "rahul.menon@vibgyor.example",
    mobile: "+91 98200 00061",
    title: "IT Platform Owner",
  },
];

/* Students in the pilot campus, for the consent tracker (CS-1, CS-2) */
const rosterSeed: [string, number, "awaiting_consent" | "active" | "paused"][] = [
  ["Ishita Rane", 12, "active"],
  ["Kunal Shah", 10, "awaiting_consent"],
  ["Zara Sheikh", 9, "active"],
  ["Om Patil", 11, "awaiting_consent"],
  ["Tara D'Souza", 8, "active"],
  ["Vihaan Agarwal", 12, "paused"],
  ["Myra Bansal", 10, "active"],
  ["Reyansh Kulkarni", 9, "awaiting_consent"],
  ["Anika Joshi", 11, "active"],
  ["Aditya Rao", 8, "awaiting_consent"],
];

rosterSeed.forEach(([name, cls, status], i) => {
  const id = `stuR${i + 1}`;
  const pid = `parR${i + 1}`;
  const last = name.split(" ")[1];
  seedUsers.push({
    id,
    name,
    role: "STU",
    campusIds: ["c01"],
    email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@student.example.in`,
    mobile: "—",
    className: cls,
    studentStatus: status,
    parentIds: [pid],
  });
  seedUsers.push({
    id: pid,
    name: `${["Rakesh", "Sunita", "Farhan", "Pooja", "Anil", "Ritu", "Sanjeev", "Deepa", "Manoj", "Kiran"][i]} ${last}`,
    role: "PAR",
    campusIds: ["c01"],
    email: `parent.${last.toLowerCase().replace(/[^a-z]/g, "")}${i}@example.com`,
    mobile: `+91 98${String(10000000 + i * 734521).slice(0, 3)} ${String(10000 + i * 3411).slice(0, 5)}`,
    childIds: [id],
  });
});

seedUsers.push({
  id: "stuR11",
  name: "Advait Kamat",
  role: "STU",
  campusIds: ["c01"],
  email: "advait.kamat@student.example.in",
  mobile: "—",
  className: 7,
  studentStatus: "not_eligible",
  parentIds: [],
});

/* Personas shown in the role switcher and login page */
export const personas: { userId: string; blurb: string }[] = [
  { userId: "stu1", blurb: "Class 11 · waiting for parent consent" },
  { userId: "stu2", blurb: "Class 12 · consented, can message mentors" },
  { userId: "par1", blurb: "Mother of Aarav (Malad) & Riya (Goregaon W)" },
  { userId: "par3", blurb: "Father · second guardian for Aarav & Riya" },
  { userId: "alu1", blurb: "Mentor · Imperial College London" },
  { userId: "alu7", blurb: "Verified alumnus · not yet a mentor" },
  { userId: "alp1", blurb: "Signed up · awaiting verification" },
  { userId: "tch1", blurb: "Teacher · Malad" },
  { userId: "cad1", blurb: "Campus Admin · Malad (pilot)" },
  { userId: "gao1", blurb: "Group office · all 39 campuses" },
  { userId: "fin1", blurb: "Finance · 2 campuses" },
  { userId: "mcz1", blurb: "MyCareerZ · 3 campuses" },
  { userId: "sad1", blurb: "Platform owner · 2-factor" },
];

/* ---------------------- School ERP records (A2) ---------------------- */

export interface ErpRecord {
  admissionNo: string;
  name: string;
  campusId: string;
  passYear: number;
}

export const erpRecords: ErpRecord[] = [
  { admissionNo: "VG-MAL-2014-0187", name: "Karan Malhotra", campusId: "c01", passYear: 2014 },
  { admissionNo: "VG-MAL-2015-0412", name: "Imran Shaikh", campusId: "c01", passYear: 2015 },
  { admissionNo: "VG-MAL-2019-0033", name: "Pooja Reddy", campusId: "c01", passYear: 2019 },
  { admissionNo: "VG-MAL-2020-0158", name: "Nikita Sawant", campusId: "c01", passYear: 2020 },
  { admissionNo: "VG-GRW-2017-0250", name: "Fatima Ansari", campusId: "c02", passYear: 2017 },
  { admissionNo: "VG-KHR-2018-0091", name: "Siddharth Jain", campusId: "c11", passYear: 2018 },
];

/** Earliest pass year the ERP holds records for [TBC in discovery, §9] */
export const ERP_EARLIEST_YEAR = 2010;

/* -------------- Migrated records from the current platform (DM-5) -------------- */

export interface MigratedRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  campusId: string;
  batch: number;
  college?: string;
  company?: string;
  title?: string;
  verified: boolean;
  engagementCount: number;
}

export const migratedRecords: MigratedRecord[] = [
  {
    id: "m1",
    name: "Karan Malhotra",
    email: "karan.malhotra@example.com",
    mobile: "+91 98200 11187",
    campusId: "c01",
    batch: 2014,
    college: "BITS Pilani",
    company: "Zomato",
    title: "Engineering Manager",
    verified: true,
    engagementCount: 7,
  },
  {
    id: "m2",
    name: "Pooja Reddy",
    email: "pooja.reddy@example.com",
    mobile: "+91 98190 22033",
    campusId: "c01",
    batch: 2019,
    college: "St. Xavier's College, Mumbai",
    verified: false,
    engagementCount: 2,
  },
];

/* --------------------- Synthetic alumni population --------------------- */
// Deterministic, so audience counts in the broadcast composer are stable.

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const countries = [
  "India",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "United Arab Emirates",
  "Singapore",
  "Ireland",
  "Netherlands",
  "France",
  "New Zealand",
  "Japan",
  "Switzerland",
  "Hong Kong",
  "Italy",
  "Spain",
  "Sweden",
  "Malaysia",
  "Qatar",
  "Saudi Arabia",
  "South Korea",
  "Denmark",
  "Finland",
  "Belgium",
];

export interface PopulationRow {
  campusIdx: number;
  batch: number;
  countryIdx: number;
  verified: boolean;
  emailOk: boolean;
  waOptIn: boolean;
  push: boolean;
  mentor: boolean;
}

export const population: PopulationRow[] = (() => {
  const rnd = mulberry32(39);
  const rows: PopulationRow[] = [];
  const weights = campuses.map((_, i) => (i === 0 ? 8 : i < 10 ? 3 : i < 24 ? 2 : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  const countryW = [70, 6, 6, 4, 3, 1.6, 2.4, 1.2, 0.8, 0.6, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.2, 0.2, 0.3, 0.3, 0.3, 0.1, 0.1, 0.1, 0.1];
  const cTotal = countryW.reduce((a, b) => a + b, 0);
  const pick = (w: number[], t: number) => {
    let x = rnd() * t;
    for (let i = 0; i < w.length; i++) {
      x -= w[i];
      if (x <= 0) return i;
    }
    return w.length - 1;
  };
  for (let n = 0; n < 4650; n++) {
    const verified = rnd() < 0.77;
    rows.push({
      campusIdx: pick(weights, total),
      batch: 2004 + Math.floor(Math.pow(rnd(), 0.7) * 23),
      countryIdx: pick(countryW, cTotal),
      verified,
      emailOk: verified && rnd() < 0.93,
      waOptIn: rnd() < 0.58,
      push: rnd() < 0.31,
      mentor: verified && rnd() < 0.045,
    });
  }
  return rows;
})();

/* ------------------------- Messaging templates ------------------------- */

export const waTemplates = [
  {
    id: "reunion_save_the_date_v2",
    label: "Reunion – save the date",
    body: "Hi {{first_name}}, the VIBGYOR {{campus}} alumni reunion is on {{date}}. Tap below to RSVP. Reply STOP to opt out.",
  },
  {
    id: "event_invite_v3",
    label: "Event invitation",
    body: "Hi {{first_name}}, you're invited to {{event_name}} on {{date}}. See details and RSVP in the VAA app. Reply STOP to opt out.",
  },
  {
    id: "mentor_call_v1",
    label: "Call for mentors",
    body: "Hi {{first_name}}, VIBGYOR students are looking for alumni mentors in your field. Become a mentor in 2 minutes. Reply STOP to opt out.",
  },
];

/* ------------------------------ Seed state ------------------------------ */

const seedConsents: Consent[] = [
  {
    id: "con1",
    studentId: "stu2",
    givenBy: "par2",
    purpose: "platform",
    status: "granted",
    noticeVersion: NOTICE_VERSION,
    channel: "SMS OTP",
    otpRef: "OTP-55120",
    at: "2026-10-04T08:12:00.000Z",
  },
  {
    id: "con2",
    studentId: "stu2",
    givenBy: "par2",
    purpose: "mentor",
    status: "granted",
    noticeVersion: NOTICE_VERSION,
    channel: "SMS OTP",
    otpRef: "OTP-55120",
    at: "2026-10-04T08:12:00.000Z",
  },
  ...rosterSeed.flatMap(([, , status], i): Consent[] =>
    status === "awaiting_consent"
      ? []
      : [
          {
            id: `conR${i}`,
            studentId: `stuR${i + 1}`,
            givenBy: `parR${i + 1}`,
            purpose: "platform",
            status: status === "paused" ? "withdrawn" : "granted",
            noticeVersion: NOTICE_VERSION,
            channel: "SMS OTP",
            otpRef: `OTP-${41000 + i}`,
            at: ago(400 + i * 30),
            withdrawnAt: status === "paused" ? ago(50) : undefined,
          },
          ...(i % 2 === 0 && status === "active"
            ? [
                {
                  id: `conRm${i}`,
                  studentId: `stuR${i + 1}`,
                  givenBy: `parR${i + 1}`,
                  purpose: "mentor" as const,
                  status: "granted" as const,
                  noticeVersion: NOTICE_VERSION,
                  channel: "SMS OTP" as const,
                  otpRef: `OTP-${41000 + i}`,
                  at: ago(400 + i * 30),
                },
              ]
            : []),
        ]
  ),
];

const seedConversations: Conversation[] = [
  {
    id: "conv1",
    studentId: "stu2",
    mentorId: "alu3",
    campusId: "c01",
    createdAt: ago(52),
    topic: "NEET and choosing a medical college",
  },
];

const seedMessages: Message[] = [
  {
    id: "msg1",
    convId: "conv1",
    senderId: "stu2",
    text: "Hi Dr. Desai! I'm in Class 12 at Malad and preparing for NEET. How did you plan your revision in the last 6 months?",
    maskedKinds: [],
    at: ago(52),
  },
  {
    id: "msg2",
    convId: "conv1",
    senderId: "alu3",
    text: "Hi Diya, great to hear from you. I did one full mock every Sunday and spent the week fixing the weakest chapter from that mock. NCERT Biology line by line is non-negotiable.",
    maskedKinds: [],
    at: ago(49),
  },
  {
    id: "msg3",
    convId: "conv1",
    senderId: "stu2",
    text: "That helps a lot. Is it easier if I call you sometime? My number is [phone hidden]",
    maskedKinds: ["phone"],
    at: ago(30),
  },
  {
    id: "msg4",
    convId: "conv1",
    senderId: "alu3",
    text: "Let's keep it here on the platform, that's the school's rule and it keeps everyone safe. From next term you'll be able to book a 30-minute video session through the portal too.",
    maskedKinds: [],
    at: ago(28),
  },
];

const seedReports: Report[] = [
  {
    id: "rep1",
    kind: "message",
    messageId: "msg3",
    convId: "conv1",
    subjectUserId: "stu2",
    reporterId: "system",
    reason: "Auto-flag: contact details blocked (phone number)",
    campusId: "c01",
    at: ago(30),
    status: "open",
  },
];

const seedVerifications: VerificationRequest[] = [
  {
    id: "vr1",
    userId: "alp1",
    name: "Sneha Kulkarni",
    campusId: "c01",
    passYear: 2006,
    admissionNo: "Not known",
    email: "sneha.kulkarni@example.com",
    submittedAt: ago(70),
    method: "self_signup",
    fieldChecks: { name: "missing", passYear: "missing", admissionNo: "missing", campus: "match" },
    vouches: [{ by: "ext1", byName: "Nikhil Rane (Batch 2006)", at: ago(40) }],
    status: "pending",
    note: "Batch 2006 is older than the school records in the ERP (from 2010).",
  },
  {
    id: "vr2",
    userId: "alp2",
    name: "Imran Shaikh",
    campusId: "c01",
    passYear: 2015,
    admissionNo: "VG-MAL-2015-0421",
    email: "imran.shaikh@example.com",
    submittedAt: ago(20),
    method: "self_signup",
    closestRecord: { admissionNo: "VG-MAL-2015-0412", name: "Imran Shaikh", passYear: 2015, campusId: "c01" },
    fieldChecks: { name: "match", passYear: "match", admissionNo: "partial", campus: "match" },
    vouches: [],
    status: "pending",
  },
  {
    id: "vr3",
    userId: "alp3",
    name: "Fatima Ansari",
    campusId: "c02",
    passYear: 2016,
    admissionNo: "VG-GRW-2017-0250",
    email: "fatima.ansari@example.com",
    submittedAt: ago(9),
    method: "self_signup",
    closestRecord: { admissionNo: "VG-GRW-2017-0250", name: "Fatima Ansari", passYear: 2017, campusId: "c02" },
    fieldChecks: { name: "match", passYear: "mismatch", admissionNo: "match", campus: "match" },
    vouches: [],
    status: "pending",
  },
  {
    id: "vr4",
    userId: "aluX1",
    name: "Nikita Sawant",
    campusId: "c01",
    passYear: 2020,
    admissionNo: "VG-MAL-2020-0158",
    email: "nikita.sawant@example.com",
    submittedAt: ago(26),
    method: "self_signup",
    fieldChecks: { name: "match", passYear: "match", admissionNo: "match", campus: "match" },
    vouches: [],
    status: "auto_approved",
    decidedBy: "system",
    decidedAt: ago(26),
  },
  {
    id: "vr5",
    userId: "aluX2",
    name: "Siddharth Jain",
    campusId: "c11",
    passYear: 2018,
    admissionNo: "VG-KHR-2018-0091",
    email: "siddharth.jain@example.com",
    submittedAt: ago(33),
    method: "self_signup",
    fieldChecks: { name: "match", passYear: "match", admissionNo: "match", campus: "match" },
    vouches: [],
    status: "auto_approved",
    decidedBy: "system",
    decidedAt: ago(33),
  },
];

// Placeholder user records for queue entries that are not personas
const extraUsers: User[] = [
  { id: "alp2", name: "Imran Shaikh", role: "ALP", campusIds: ["c01"], email: "imran.shaikh@example.com", mobile: "+91 98922 10412", batch: 2015 },
  { id: "alp3", name: "Fatima Ansari", role: "ALP", campusIds: ["c02"], email: "fatima.ansari@example.com", mobile: "+91 98922 10250", batch: 2016 },
  { id: "aluX1", name: "Nikita Sawant", role: "ALU", campusIds: ["c01"], email: "nikita.sawant@example.com", mobile: "+91 98922 10158", batch: 2020, badges: [] },
  { id: "aluX2", name: "Siddharth Jain", role: "ALU", campusIds: ["c11"], email: "siddharth.jain@example.com", mobile: "+91 98922 10091", batch: 2018, badges: [] },
  {
    id: "aluX3",
    name: "Ishaan Bose",
    role: "ALU",
    campusIds: ["c01"],
    email: "ishaan.bose@example.com",
    mobile: "+91 98922 10777",
    batch: 2017,
    college: "University of Edinburgh",
    country: "United Kingdom",
    course: "Economics",
    company: "Barclays",
    title: "Analyst",
    badges: [],
  },
];
seedUsers.push(...extraUsers);

const seedBadgeRequests: BadgeRequest[] = [
  {
    id: "br1",
    userId: "aluX3",
    badge: "Mentor",
    campusId: "c01",
    motivation: "I'd like to help students applying to UK universities for economics.",
    codeAcceptedAt: ago(15),
    at: ago(15),
    status: "pending",
  },
];

const seedAudit: AuditEntry[] = [
  { id: "a1", at: ago(70), actorId: "system", action: "Verification queued", target: "Sneha Kulkarni", campusId: "c01", category: "verification", detail: "No school record for batch 2006" },
  { id: "a2", at: ago(52), actorId: "stu2", action: "Conversation started", target: "Diya Iyer ↔ Dr. Ananya Desai", campusId: "c01", category: "safeguarding" },
  { id: "a3", at: ago(33), actorId: "system", action: "Alumnus auto-verified", target: "Siddharth Jain", campusId: "c11", category: "verification", detail: "Pass year + admission no. + name matched ERP" },
  { id: "a4", at: ago(30), actorId: "system", action: "Contact details masked", target: "Message in Diya Iyer ↔ Dr. Ananya Desai", campusId: "c01", category: "safeguarding", detail: "phone" },
  { id: "a5", at: ago(26), actorId: "system", action: "Alumnus auto-verified", target: "Nikita Sawant", campusId: "c01", category: "verification", detail: "Pass year + admission no. + name matched ERP" },
  { id: "a6", at: ago(12), actorId: "cad1", action: "Exported report", target: "Malad – data completeness", campusId: "c01", category: "data_access", detail: "Reason: monthly review with principal" },
];


/* ============================ Phase 2 seed data ============================ */

/** A date `days` after 25 Nov 2026 at `hourIST` (India is UTC+5:30) */
const ahead = (days: number, hourIST = 18) =>
  new Date(Date.parse("2026-11-25T00:00:00.000Z") + days * 86400_000 + (hourIST * 60 - 330) * 60_000).toISOString();

export const defaultPrivacy: AlumniProfile["privacy"] = {
  email: "private",
  mobile: "private",
  company: "alumni",
  city: "alumni",
  work: "alumni",
  education: "alumni",
};

export const visibilityLabels: Record<Visibility, string> = {
  alumni: "All verified alumni",
  batch: "My batch only",
  private: "Only me",
};

export const privateFieldLabels: Record<PrivateField, string> = {
  email: "Email address",
  mobile: "Mobile number",
  company: "Current company",
  city: "City",
  work: "Work history",
  education: "Higher education",
};

function emptyProfile(u: User): AlumniProfile {
  const thisYear = 2026;
  return {
    work: u.company ? [{ id: `w-${u.id}`, company: u.company, title: u.title ?? "", from: Math.min(thisYear, (u.batch ?? 2015) + 6) }] : [],
    education: u.college ? [{ id: `e-${u.id}`, institution: u.college, degree: u.course ?? "", from: (u.batch ?? 2015), to: (u.batch ?? 2015) + 4 }] : [],
    achievements: [],
    skills: [],
    privacy: { ...defaultPrivacy },
    openTo: { mentoring: activeMentor(u), hiring: false, speaking: false },
  };
}

function activeMentor(u: User) {
  return !!u.badges?.some((b) => b.type === "Mentor" && b.status === "active");
}

/* Extra verified alumni so the directory feels real */
const dirFirst = ["Aditi", "Rahul", "Simran", "Nikhil", "Farah", "Kunal", "Isha", "Varun", "Ananya", "Siddharth", "Pooja", "Aman", "Tanvi", "Yash", "Nandini", "Harsh", "Sara", "Dev", "Ritika", "Omkar", "Shreya", "Kartik", "Mihika", "Neil"];
const dirLast = ["Bhatia", "Menon", "Chopra", "Deshpande", "Ansari", "Sethi", "Malhotra", "Iyer", "Banerjee", "Reddy", "Gokhale", "Verma", "Saxena", "Shetty", "Rao", "Thakur", "Fernandes", "Mistry", "Ghosh", "Pawar", "Naidu", "Jain", "Kale", "D'Costa"];
const dirJobs: [string, string, string, string, string][] = [
  // company, title, city, country, field
  ["Tata Consultancy Services", "Consultant", "Pune", "India", "IT services"],
  ["HDFC Bank", "Relationship Manager", "Mumbai", "India", "Banking"],
  ["Amazon", "Product Manager", "Seattle", "United States", "Product management"],
  ["Zomato", "Growth Lead", "Gurugram", "India", "Marketing"],
  ["McKinsey & Company", "Associate", "London", "United Kingdom", "Consulting"],
  ["Apollo Hospitals", "Physiotherapist", "Chennai", "India", "Healthcare"],
  ["Ogilvy", "Copywriter", "Mumbai", "India", "Advertising"],
  ["Infosys", "Software Engineer", "Bengaluru", "India", "Software engineering"],
  ["Emirates", "Cabin Services Manager", "Dubai", "United Arab Emirates", "Aviation"],
  ["Accenture", "Analyst", "Toronto", "Canada", "Consulting"],
  ["Self-employed", "Architect", "Mumbai", "India", "Architecture"],
  ["Razorpay", "Backend Engineer", "Bengaluru", "India", "Software engineering"],
  ["Khaitan & Co", "Associate Lawyer", "Mumbai", "India", "Law"],
  ["Nykaa", "Brand Manager", "Mumbai", "India", "Marketing"],
  ["Deutsche Bank", "Analyst", "Frankfurt", "Germany", "Banking"],
  ["Byju's", "Content Lead", "Bengaluru", "India", "Education"],
  ["Unilever", "Supply Chain Manager", "Singapore", "Singapore", "Operations"],
  ["Times of India", "Journalist", "Mumbai", "India", "Media"],
  ["Mahindra", "Design Engineer", "Pune", "India", "Engineering"],
  ["Fortis", "Dentist", "Mumbai", "India", "Healthcare"],
  ["Goldman Sachs", "Associate", "Bengaluru", "India", "Banking"],
  ["Freshworks", "UX Researcher", "Chennai", "India", "Product design"],
  ["Monash University", "PhD Candidate", "Melbourne", "Australia", "Research"],
  ["Dream11", "Data Analyst", "Mumbai", "India", "Data science"],
];
const dirColleges: [string, string][] = [
  ["Mumbai University", "B.Com"], ["St. Xavier's College", "BA Economics"], ["NMIMS", "BBA"], ["VIT Vellore", "B.Tech"],
  ["Symbiosis", "BBA LLB"], ["University of Warwick", "BSc Management"], ["Manipal Institute of Technology", "B.Tech"], ["Christ University", "BA Psychology"],
];
const dirCampusIdx = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 4, 5, 6, 10, 11, 0, 0, 1, 16, 0, 2];

{
  const rnd = mulberry32(2026);
  dirFirst.forEach((first, i) => {
    const [company, title, city, country, field] = dirJobs[i];
    const [college, course] = dirColleges[i % dirColleges.length];
    const batch = i < 6 ? [2016, 2016, 2006, 2006, 2013, 2016][i] : 2008 + Math.floor(rnd() * 17);
    const id = `dir${i + 1}`;
    const u: User = {
      id,
      name: `${first} ${dirLast[i]}`,
      role: "ALU",
      campusIds: [campuses[dirCampusIdx[i]].id],
      email: `${first.toLowerCase()}.${dirLast[i].toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
      mobile: country === "India" ? `+91 9${String(800000000 + Math.floor(rnd() * 99999999)).slice(0, 4)} ${String(10000 + Math.floor(rnd() * 89999))}` : "+1 555 010 0000",
      batch,
      college,
      course,
      country,
      city,
      company,
      title,
      field,
      badges: [],
    };
    u.profile = emptyProfile(u);
    if (i % 3 === 0) u.profile.privacy.company = "batch";
    if (i % 5 === 0) u.profile.privacy.city = "private";
    if (i % 4 === 1) u.profile.openTo.hiring = true;
    seedUsers.push(u);
  });
}

/* Full profiles for the main personas */
const richProfiles: Record<string, Partial<AlumniProfile>> = {
  alu7: {
    headline: "Director of Product at Flipkart · Batch of 2006, Malad",
    work: [
      { id: "w71", company: "Flipkart", title: "Director, Product", from: 2019 },
      { id: "w72", company: "Myntra", title: "Senior Product Manager", from: 2015, to: 2019 },
      { id: "w73", company: "Infosys", title: "Business Analyst", from: 2012, to: 2015 },
    ],
    education: [
      { id: "e71", institution: "Narsee Monjee College", degree: "B.Com", from: 2006, to: 2009 },
      { id: "e72", institution: "IIM Indore", degree: "MBA", from: 2010, to: 2012 },
    ],
    achievements: ["Led Flipkart's Big Billion Days checkout redesign (2022)", "VIBGYOR Malad House Captain, 2005–06"],
    skills: ["Product strategy", "E-commerce", "Team leadership"],
    linkedin: "linkedin.com/in/rohan-gupta-demo",
    resumeName: "Rohan_Gupta_CV_2026.pdf",
    openTo: { mentoring: false, hiring: true, speaking: true },
  },
  alu1: {
    work: [
      { id: "w11", company: "Google", title: "Software Engineer", from: 2023 },
      { id: "w12", company: "Bloomberg", title: "Software Engineering Intern", from: 2022, to: 2022 },
    ],
    education: [{ id: "e11", institution: "Imperial College London", degree: "MEng Computing", from: 2016, to: 2020 }],
    achievements: ["Dean's List, Imperial (2019)", "VIBGYOR Malad science fair winner, 2015"],
    skills: ["Python", "Distributed systems", "UCAS applications"],
    openTo: { mentoring: true, hiring: false, speaking: true },
  },
  alu5: {
    achievements: ["All-India rank 34, CA Final (2019)"],
    skills: ["Audit", "Taxation", "CUET guidance"],
    openTo: { mentoring: true, hiring: true, speaking: false },
  },
};

seedUsers.forEach((u) => {
  if (u.role !== "ALU" || u.profile) return;
  const base = emptyProfile(u);
  const extra = richProfiles[u.id];
  u.profile = extra ? { ...base, ...extra, privacy: { ...base.privacy } } : base;
});
// Sneha (pending) can start her profile while she waits
{
  const sneha = seedUsers.find((u) => u.id === "alp1")!;
  sneha.profile = { ...emptyProfile(sneha), headline: "Marketing, Dubai", privacy: { ...defaultPrivacy } };
}

export const seedJobs: Job[] = [
  {
    id: "job1",
    title: "Associate Product Manager",
    company: "Flipkart",
    location: "Bengaluru",
    type: "Full-time",
    remote: false,
    description: "Join the checkout team. 0–2 years' experience, strong analytical skills. VIBGYOR alumni referrals get a guaranteed first-round interview.",
    postedBy: "alu7",
    campusId: "c01",
    forStudents: false,
    status: "approved",
    at: ago(70),
    decidedBy: "cad1",
    interested: [{ userId: "dir1", at: ago(30) }],
  },
  {
    id: "job2",
    title: "Summer audit internship (Class 12 / first-year)",
    company: "Deloitte",
    location: "Mumbai",
    type: "Internship",
    remote: false,
    description: "Four-week job-shadowing programme in May. Students apply through their campus career counsellor; parent consent is needed.",
    postedBy: "alu5",
    campusId: "c01",
    forStudents: true,
    status: "approved",
    at: ago(120),
    decidedBy: "cad1",
    interested: [],
  },
  {
    id: "job3",
    title: "Backend Engineer (Go)",
    company: "Razorpay",
    location: "Bengaluru",
    type: "Full-time",
    remote: true,
    description: "Payments infrastructure. 2–5 years with Go or Java. Hybrid or remote within India.",
    postedBy: "dir12",
    campusId: "c03",
    forStudents: false,
    status: "approved",
    at: ago(200),
    decidedBy: "gao1",
    interested: [],
  },
  {
    id: "job4",
    title: "Design internship – UX research",
    company: "Swiggy",
    location: "Bengaluru · remote",
    type: "Internship",
    remote: true,
    description: "Eight-week remote internship for design undergraduates. Portfolio required.",
    postedBy: "alu4",
    campusId: "c17",
    forStudents: false,
    status: "approved",
    at: ago(260),
    decidedBy: "gao1",
    interested: [],
  },
  {
    id: "job5",
    title: "Growth Marketing Lead",
    company: "Nykaa",
    location: "Mumbai",
    type: "Full-time",
    remote: false,
    description: "Own performance marketing for the fashion vertical. 5+ years. Contact me on [phone hidden] for a referral.",
    postedBy: "dir14",
    campusId: "c01",
    forStudents: false,
    status: "pending",
    at: ago(5),
    interested: [],
  },
];

export const seedEvents: VaaEvent[] = [
  {
    id: "ev1",
    title: "Malad Alumni Reunion 2026",
    kind: "Reunion",
    description: "Batches 2004–2016 come home. Campus tour, the old staffroom crew, dinner on the main lawn. Partners welcome (+1).",
    campusIds: ["c01"],
    audience: ["ALU"],
    start: ahead(25, 18),
    end: ahead(25, 22),
    venue: "VIBGYOR High, Malad West – main lawn",
    online: false,
    capacity: 250,
    createdBy: "cad1",
    createdAt: ago(120),
    rsvps: [
      { userId: "alu5", status: "going", at: ago(100), guests: 1 },
      { userId: "dir1", status: "going", at: ago(90) },
      { userId: "dir2", status: "maybe", at: ago(80) },
      { userId: "dir3", status: "going", at: ago(60), guests: 1 },
    ],
  },
  {
    id: "ev2",
    title: "Studying in the UK: alumni panel",
    kind: "Webinar",
    description: "Priya (Imperial) and two other alumni explain UCAS, personal statements, admission tests and costs. Students and parents welcome; questions are moderated by the campus.",
    campusIds: "all",
    audience: ["ALU", "STU", "PAR"],
    start: ahead(9, 18),
    end: ahead(9, 19),
    venue: "Online – link sent to registered attendees",
    online: true,
    capacity: 500,
    createdBy: "gao1",
    createdAt: ago(150),
    rsvps: [
      { userId: "alu1", status: "going", at: ago(140) },
      { userId: "stu2", status: "going", at: ago(40) },
      { userId: "par2", status: "going", at: ago(39) },
    ],
  },
  {
    id: "ev3",
    title: "Bengaluru chapter meetup",
    kind: "Meetup",
    description: "Informal evening for alumni living in Bengaluru, all campuses. First drink on the chapter.",
    campusIds: "all",
    audience: ["ALU"],
    start: ahead(16, 19),
    end: ahead(16, 22),
    venue: "Toit, Indiranagar, Bengaluru",
    online: false,
    capacity: 60,
    createdBy: "gao1",
    createdAt: ago(48),
    rsvps: [
      { userId: "alu7", status: "going", at: ago(20) },
      { userId: "alu4", status: "going", at: ago(18) },
    ],
  },
  {
    id: "ev4",
    title: "Career talk: commerce after Class 12",
    kind: "Career talk",
    description: "Arjun (SRCC, CA) talks Class 11–12 students through CUET, B.Com vs BBA and the CA route. In the auditorium during school hours; teachers present.",
    campusIds: ["c01"],
    audience: ["STU", "PAR"],
    start: ahead(6, 11),
    end: ahead(6, 12),
    venue: "VIBGYOR High, Malad – auditorium",
    online: false,
    capacity: 180,
    createdBy: "cad1",
    createdAt: ago(30),
    rsvps: [],
  },
  {
    id: "ev5",
    title: "Class 8 parents: choosing subjects for Class 9",
    kind: "Career talk",
    description: "The Goregaon West counselling team and two alumni explain subject choices for Class 9–10 and what they mean later. For Class 8 students and their parents.",
    campusIds: ["c02"],
    audience: ["STU", "PAR"],
    start: ahead(9, 17),
    end: ahead(9, 18),
    venue: "VIBGYOR High, Goregaon West – multipurpose hall",
    online: false,
    capacity: 120,
    createdBy: "gao1",
    createdAt: ago(20),
    rsvps: [],
  },
];

export const seedPosts: GroupPost[] = [
  { id: "gp1", groupId: "batch:c01:2006", authorId: "alu7", text: "20 years since we left Malad! Who's coming to the reunion on 20 Dec? Let's get the whole 2006 batch there.", at: ago(26), likes: ["dir3"] },
  { id: "gp2", groupId: "batch:c01:2006", authorId: "dir3", text: "Count me in. I still have the class photo from the farewell, will bring it 📸", at: ago(22), likes: ["alu7"] },
  { id: "gp3", groupId: "campus:c01", authorId: "cad1", text: "Reminder from the Alumni office: the Malad reunion RSVP closes on 15 December. Spouses welcome.", at: ago(50), likes: ["alu5", "dir1"] },
  { id: "gp4", groupId: "campus:c01", authorId: "alu5", text: "Deloitte Mumbai is running a student job-shadowing week in May; I've posted it on the jobs board for current students.", at: ago(110), likes: [] },
  { id: "gp6", groupId: "campus:c01", authorId: "dir6", text: "Selling my old IB textbooks and a lot of crypto courses at 70% off!! Message me for the link 🔥🔥", at: ago(31), likes: [] },
  { id: "gp5", groupId: "batch:c01:2016", authorId: "alu1", text: "Anyone from 2016 in London this winter? Planning a small dinner before Christmas.", at: ago(75), likes: ["dir1", "dir2"] },
];

export const seedDmThreads: DmThread[] = [{ id: "dm1", members: ["alu7", "alu5"], createdAt: ago(40) }];
export const seedDms: DmMessage[] = [
  { id: "dmm1", threadId: "dm1", senderId: "alu5", text: "Hi Rohan, saw your APM opening. A junior from my CA batch is interested; can I refer her?", at: ago(40) },
  { id: "dmm2", threadId: "dm1", senderId: "alu7", text: "Absolutely Arjun, ask her to mark interest on the jobs board and I'll pick it up.", at: ago(38) },
];

export const seedInvites: Invite[] = [
  ...["alu5", "alu5", "alu5", "alu5", "alu5", "alu5", "alu1", "alu1", "alu1", "alu1", "dir1", "dir1", "dir1", "alu7", "alu7", "dir3", "dir3", "alu2"].map((by, i) => ({
    id: `inv${i + 1}`,
    by,
    to: `batchmate${i + 1}@example.com`,
    channel: (i % 2 ? "whatsapp" : "email") as Invite["channel"],
    at: ago(24 * (i + 2)),
    joined: i % 3 !== 2,
  })),
];

/* ============================ Phase 3 seed data ============================ */

/* Two duplicate records, as they would arrive from the old portal (L4) */
{
  const aditi = seedUsers.find((u) => u.id === "dir1")!;
  const nikhil = seedUsers.find((u) => u.id === "dir4")!;
  const d1: User = {
    ...structuredClone(aditi),
    id: "dup1",
    name: "Aditi S. Bhatia",
    email: "aditi.bhatia@oldportal.example",
    mobile: "+91 98111 20456",
    college: "Bombay University",
    field: "IT Consulting",
    title: "Consultant",
    city: "Pune",
  };
  d1.profile = { ...emptyProfile(d1), privacy: { ...defaultPrivacy } };
  const d2: User = {
    ...structuredClone(nikhil),
    id: "dup2",
    name: "Nikhil Deshpandey",
    email: "nikhil.d@oldportal.example",
    college: "Mumbai Univ.",
    company: undefined,
    title: undefined,
  };
  d2.profile = { ...emptyProfile(d2), privacy: { ...defaultPrivacy } };
  seedUsers.push(d1, d2);
  // messy values the master lists should catch (L5 / DM-3)
  seedUsers.find((u) => u.id === "dir15")!.college = "Xaviers Mumbai";
  seedUsers.find((u) => u.id === "dir13")!.course = "B.A. LL.B";
}

const masterAliases: Record<MasterKind, Record<string, string[]>> = {
  college: {
    "Mumbai University": ["University of Mumbai", "Bombay University", "MU"],
    "St. Xavier's College": ["St Xaviers College", "SXC Mumbai"],
    "IIT Bombay": ["Indian Institute of Technology Bombay", "IITB"],
  },
  programme: {
    "B.Com": ["BCom", "Bachelor of Commerce"],
    "BBA LLB": ["BBA, LLB"],
    "Computer Science": ["CS", "Computer Engineering"],
  },
  industry: {
    "Software engineering": ["Software", "Software development"],
    Consulting: ["Management consulting"],
  },
};
const messy = new Set(["Xaviers Mumbai", "B.A. LL.B", "Mumbai Univ.", "IT Consulting", "Bombay University"]);
const userKey: Record<MasterKind, keyof User> = { college: "college", programme: "course", industry: "field" };

export const seedMasters: Record<MasterKind, MasterItem[]> = (["college", "programme", "industry"] as MasterKind[]).reduce(
  (acc, kind) => {
    const names = new Set<string>(Object.keys(masterAliases[kind]));
    seedUsers.forEach((u) => {
      const v = u[userKey[kind]] as string | undefined;
      if (v && !messy.has(v)) names.add(v);
    });
    acc[kind] = [...names].sort().map((name, i) => ({ id: `${kind[0]}${i + 1}`, name, aliases: masterAliases[kind][name] ?? [] }));
    return acc;
  },
  {} as Record<MasterKind, MasterItem[]>
);
export const masterUserKey = userKey;

export const seedEngagements: EngagementEntry[] = [
  { id: "en1", alumniId: "alu7", staffId: "cad1", campusId: "c01", mode: "Call", category: "Event", note: "Asked Rohan to speak at the reunion about product careers. Said yes in principle.", at: ago(30), source: "manual" },
  { id: "en2", alumniId: "alu5", staffId: "cad1", campusId: "c01", mode: "Meeting", category: "Placement", note: "Met at Deloitte office about the May job-shadowing week for Class 12.", at: ago(140), source: "manual" },
  { id: "en3", alumniId: "alu1", staffId: "cad1", campusId: "c01", mode: "Email", category: "Mentoring", note: "Thanked Priya for answering 6 student questions this term.", at: ago(200), source: "manual" },
  { id: "en4", alumniId: "dir1", staffId: "cad1", campusId: "c01", mode: "WhatsApp", category: "Data update", note: "Confirmed new employer (TCS).", at: ago(260), source: "bulk" },
  { id: "en5", alumniId: "dir2", staffId: "cad1", campusId: "c01", mode: "Event", category: "Event", note: "Attended the Diwali alumni evening.", at: ago(500), source: "bulk" },
  { id: "en6", alumniId: "alu2", staffId: "gao1", campusId: "c02", mode: "Call", category: "Fundraising", note: "Interested in sponsoring a STEM scholarship (Release 3).", at: ago(90), source: "manual" },
  { id: "en7", alumniId: "alu6", staffId: "gao1", campusId: "c25", mode: "Meeting", category: "General", note: "Founder story for the VAA newsletter.", at: ago(320), source: "manual" },
];

const due = (fromHoursAgo: number) => new Date(Date.parse(ago(fromHoursAgo)) + 30 * 86400_000).toISOString();
export const REQUEST_DAYS = 30;
export const seedDataRequests: DataRequest[] = [
  { id: "dr1", type: "access", subjectId: "alu5", requesterId: "alu5", campusId: "c01", details: "Please send me a copy of all data you hold about me.", at: ago(72), due: due(72), status: "open" },
  { id: "dr2", type: "correction", subjectId: "stu1", requesterId: "par1", campusId: "c01", details: "Aarav's date of birth is shown as 2010; it should be 12 March 2009.", at: ago(120), due: due(120), status: "in_progress" },
  { id: "dr3", type: "deletion", subjectId: "dir19", requesterId: "dir19", campusId: "c01", details: "I no longer want to be on the alumni platform. Please delete my account.", at: ago(26 * 24), due: due(26 * 24), status: "open" },
  { id: "dr4", type: "complaint", subjectId: "alu4", requesterId: "alu4", campusId: "c17", details: "I received a marketing WhatsApp after opting out.", at: ago(20 * 24), due: due(20 * 24), status: "done", resolution: "Opt-out had not synced to the WhatsApp list. Fixed and apologised.", resolvedBy: "gao1", resolvedAt: ago(15 * 24) },
];

export const seedModerationReports: Report[] = [
  { id: "rep2", kind: "post", postId: "gp6", subjectUserId: "dir6", reporterId: "alu5", reason: "Spam / selling", campusId: "c01", at: ago(30), status: "open" },
  { id: "rep3", kind: "profile", subjectUserId: "dir7", reporterId: "dir1", reason: "Fake or impersonating profile", campusId: "c01", at: ago(5), status: "open" },
  { id: "rep4", kind: "job", jobId: "job4", subjectUserId: "alu4", reporterId: "dir12", reason: "Misleading job details", campusId: "c17", at: ago(50), status: "actioned", resolution: "Warning sent to user", resolvedBy: "gao1", resolvedAt: ago(41) },
];
export const MODERATION_SLA_HOURS = 24;

export const capabilityLabels: Record<Capability, string> = {
  "records.view": "View alumni records",
  "records.edit": "Edit or deactivate alumni records",
  "records.export": "Export data (with a reason)",
  verify: "Approve alumni verification",
  "chats.read": "Read student–mentor chats",
  "broadcast.send": "Send broadcasts",
  "content.moderate": "Moderate reported content",
  "duplicates.merge": "Merge duplicate records",
  "masters.edit": "Edit master lists",
  "requests.handle": "Handle data & privacy requests",
  "engagement.log": "Log alumni interactions",
};

export const seedPermissions: Record<Capability, Role[]> = {
  "records.view": ["CAD", "GAO", "SAD"],
  "records.edit": ["CAD", "GAO", "SAD"],
  "records.export": ["CAD", "GAO", "SAD"],
  verify: ["CAD", "GAO"],
  "chats.read": ["CAD", "GAO"],
  "broadcast.send": ["CAD", "GAO"],
  "content.moderate": ["CAD", "GAO", "SAD"],
  "duplicates.merge": ["GAO", "SAD"],
  "masters.edit": ["GAO", "SAD"],
  "requests.handle": ["CAD", "GAO", "SAD"],
  "engagement.log": ["TCH", "CAD", "GAO"],
};

export const STATE_VERSION = 6;

export function createSeedState(): State {
  return {
    version: STATE_VERSION,
    currentUserId: null,
    users: structuredClone(seedUsers),
    consents: structuredClone(seedConsents),
    conversations: structuredClone(seedConversations),
    messages: structuredClone(seedMessages),
    reports: [...structuredClone(seedReports), ...structuredClone(seedModerationReports)],
    verifications: structuredClone(seedVerifications),
    badgeRequests: structuredClone(seedBadgeRequests),
    broadcasts: [
      {
        id: "bc1",
        title: "Malad Reunion 2026 – save the date",
        createdBy: "cad1",
        campusIds: ["c01"],
        batchFrom: 2004,
        batchTo: 2016,
        countries: "all",
        segment: "all_verified",
        channels: ["email", "whatsapp"],
        waTemplate: "reunion_save_the_date_v2",
        subject: "Save the date: Malad Alumni Reunion, 20 December",
        body: "Dear {{first_name}},\n\nWe're bringing batches 2004–2016 back to campus on Saturday 20 December.",
        audience: 212,
        reach: { email: 168, whatsapp: 121 },
        status: "delivered",
        createdAt: ago(120),
        stats: {
          email: { sent: 168, delivered: 163, opened: 87, clicked: 34 },
          whatsapp: { sent: 121, delivered: 118, opened: 101, clicked: 46 },
        },
      },
    ],
    outbox: [],
    audit: structuredClone(seedAudit),
    campusMinClass: Object.fromEntries(campuses.map((c) => [c.id, 8])),
    pendingOtps: {},
    jobs: structuredClone(seedJobs),
    events: structuredClone(seedEvents),
    posts: structuredClone(seedPosts),
    dmThreads: structuredClone(seedDmThreads),
    dms: structuredClone(seedDms),
    invites: structuredClone(seedInvites),
    engagements: structuredClone(seedEngagements),
    dataRequests: structuredClone(seedDataRequests),
    masters: structuredClone(seedMasters),
    permissions: structuredClone(seedPermissions),
  };
}

export { T0 };
