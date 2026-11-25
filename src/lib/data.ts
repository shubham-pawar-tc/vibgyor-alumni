import type {
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
    body: "Let your child message alumni who hold the Mentor badge and have signed VIBGYOR's safeguarding code. Every message is recorded, visible to the campus alumni office, and phone numbers or emails are hidden automatically.",
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
    parentIds: ["par1"],
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
  // Parents
  {
    id: "par1",
    name: "Neha Mehta",
    role: "PAR",
    campusIds: ["c01"],
    email: "neha.mehta@example.com",
    mobile: "+91 98200 45210",
    childIds: ["stu1"],
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
  { userId: "par1", blurb: "Aarav's mother" },
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

export const STATE_VERSION = 3;

export function createSeedState(): State {
  return {
    version: STATE_VERSION,
    currentUserId: null,
    users: structuredClone(seedUsers),
    consents: structuredClone(seedConsents),
    conversations: structuredClone(seedConversations),
    messages: structuredClone(seedMessages),
    reports: structuredClone(seedReports),
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
  };
}

export { T0 };
