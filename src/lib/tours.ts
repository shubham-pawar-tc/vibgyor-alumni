/* ------------------------------------------------------------------
   Guided tours: one per RFQ demo scenario (§22.2).
   Each step says WHO you are, WHERE to go, and WHAT to click.
   as: persona id to switch to · null = signed out (visitor) · undefined = keep current
------------------------------------------------------------------- */

export interface TourStep {
  as?: string | null;
  path: string;
  title: string;
  doThis: string[]; // short click-by-click instructions
  notice: string; // what the evaluator should see
}

export interface Tour {
  id: number;
  title: string;
  short: string;
  steps: TourStep[];
}

export const tours: Tour[] = [
  {
    id: 1,
    title: "A parent gives permission",
    short: "Student accounts stay locked until a parent says yes.",
    steps: [
      {
        as: "stu1",
        path: "/portal",
        title: "Aarav's account is locked",
        doThis: ["Click the purple button “Ask my parent now”."],
        notice: "Aarav is under 18. He can't use anything until his parent agrees.",
      },
      {
        path: "/portal",
        title: "Neha gets a message on her phone",
        doThis: ["Open the dark “Device simulator” button (bottom right).", "This is Neha's phone. Tap “Open consent link”."],
        notice: "The message goes to the mobile number the school already has, so only the real parent gets it.",
      },
      {
        path: "/consent/stu1",
        title: "Neha proves it's her",
        doThis: ["Click “Send code to my mobile”.", "Click “Autofill demo code”, then “Verify”."],
        notice: "A one-time code (OTP) proves the parent is who they say they are.",
      },
      {
        path: "/consent/stu1",
        title: "Neha chooses what's allowed",
        doThis: ["Switch on “Talk to approved alumni mentors”.", "Tick “I am Aarav's parent”.", "Click “Confirm my choices”."],
        notice: "Each permission is separate. The choice, time and code are saved as proof.",
      },
      {
        as: "stu1",
        path: "/portal",
        title: "Aarav's account is open",
        doThis: ["Look: the lock is gone. Aarav can now find a mentor."],
        notice: "The account switched on the moment the parent agreed.",
      },
      {
        as: "par1",
        path: "/portal/consent",
        title: "Neha can change her mind any time",
        doThis: ["Switch off “Talk to approved alumni mentors”.", "Click “Withdraw now”."],
        notice: "It works immediately: Aarav can no longer see or message mentors.",
      },
    ],
  },
  {
    id: 2,
    title: "A student asks a mentor",
    short: "Safe chat: only approved mentors, everything recorded, contact details hidden.",
    steps: [
      {
        as: "stu2",
        path: "/portal/mentors",
        title: "Diya sees only approved mentors",
        doThis: ["Look at the % match on each card.", "Click “Ask a question” on any mentor."],
        notice: "Students never see the full alumni list, only mentors who signed the safety rules. Best match first.",
      },
      {
        path: "/portal/mentors",
        title: "Diya tries to share her number",
        doThis: ["Type a topic and a question.", "Add “call me on 98200 12345” — watch the yellow warning.", "Click “Send question”."],
        notice: "Phone numbers, emails, links and social media names are hidden automatically.",
      },
      {
        path: "/portal/messages",
        title: "The number is hidden in the chat",
        doThis: ["See the yellow “phone hidden” label in your message.", "Open the chat with Dr. Ananya Desai on the left and click “Report” under one of her messages."],
        notice: "Students and mentors can't swap contact details. The school can read every chat.",
      },
      {
        as: "cad1",
        path: "/portal/admin/safeguarding",
        title: "The school is alerted",
        doThis: ["See the automatic alert at the top.", "Click “View conversation” to read the chat."],
        notice: "Opening a student chat is itself recorded in the audit log.",
      },
      {
        as: "cad1",
        path: "/portal/admin/safeguarding",
        title: "The school can stop a mentor instantly",
        doThis: ["Open the “Mentor badges” tab.", "Click “Suspend” on Dr. Ananya Desai, then “Suspend now”."],
        notice: "She disappears from student search and all her student chats become read-only.",
      },
    ],
  },
  {
    id: 3,
    title: "A former student joins",
    short: "Alumni are checked against school records before they get access.",
    steps: [
      {
        as: null,
        path: "/join",
        title: "Karan joins and is checked automatically",
        doThis: ["Click “I'm new here”.", "Click “Fill an exact match”, then “Continue”.", "Click “Autofill demo code”, then “Verify”."],
        notice: "His pass year and admission number match school records, so he's verified instantly.",
      },
      {
        as: null,
        path: "/join",
        title: "Pooja makes a typo",
        doThis: ["Click “I'm new here”.", "Click “Fill a typo in admission no.”, then “Continue”.", "Autofill the code and Verify."],
        notice: "Details don't match exactly, so she is sent to the school to check by hand.",
      },
      {
        as: "cad1",
        path: "/portal/admin/verification",
        title: "The school checks side by side",
        doThis: ["Pick a person on the left.", "Compare “Submitted” with “School record” (✓ ⚠ ✗).", "Click “Approve”."],
        notice: "Staff see exactly which field is different before deciding.",
      },
      {
        as: "alu7",
        path: "/portal/vouch",
        title: "Old batches: friends can confirm",
        doThis: ["Rohan is from batch 2006. Sneha from his batch needs one more vouch.", "Click “I know them”, tick the box, then “Confirm vouch”."],
        notice: "Two batchmates vouching = verified. Useful for batches older than the school's digital records.",
      },
    ],
  },
  {
    id: 4,
    title: "The school sends a message",
    short: "Email, WhatsApp and app messages to alumni, respecting every opt-out.",
    steps: [
      {
        as: "cad1",
        path: "/portal/admin/broadcast",
        title: "Meera starts a new message",
        doThis: ["Click “New broadcast”."],
        notice: "Meera is a campus admin, so her campus is locked to Malad.",
      },
      {
        as: "cad1",
        path: "/portal/admin/broadcast",
        title: "Choose who gets it",
        doThis: ["Change the batches or country.", "Turn channels on or off.", "Watch the numbers on the right change."],
        notice: "People who said no to a channel are removed automatically. Students are never included.",
      },
      {
        as: "cad1",
        path: "/portal/admin/broadcast",
        title: "Preview and send",
        doThis: ["Click WhatsApp / Email / Push above the phone to preview.", "Click “Send to … alumni”."],
        notice: "It shows “Sending”, then “Delivered” with opened and clicked numbers. Previews appear in the Device simulator.",
      },
      {
        as: "gao1",
        path: "/portal/admin/broadcast",
        title: "Head office can reach all campuses",
        doThis: ["Click “New broadcast”.", "Open the Campus list: “All 39 campuses” is available."],
        notice: "Each person only sees and acts on the campuses they're responsible for.",
      },
      {
        as: "gao1",
        path: "/portal/admin/audit",
        title: "Everything is recorded",
        doThis: ["Scroll the list: every send, consent, check and view is here."],
        notice: "Who did what, and when. Exports ask for a reason, which is recorded too.",
      },
    ],
  },
];
