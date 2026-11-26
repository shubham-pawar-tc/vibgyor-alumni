import { seedUsers } from "@/lib/data";
import { FALLBACK_PARAM } from "@/lib/routeFallback";
import ParentConsentPage from "./ConsentClient";

// Static export: pre-build the consent page for every seeded student, plus a placeholder
// that firebase.json rewrites to for any other student ID.
export function generateStaticParams() {
  return [...seedUsers.filter((u) => u.role === "STU").map((u) => ({ studentId: u.id })), { studentId: FALLBACK_PARAM }];
}

export default function Page() {
  return <ParentConsentPage />;
}
