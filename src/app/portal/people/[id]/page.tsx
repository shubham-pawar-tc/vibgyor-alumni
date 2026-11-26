import { seedUsers } from "@/lib/data";
import { FALLBACK_PARAM } from "@/lib/routeFallback";
import PersonPage from "./PersonClient";

// Static export: pre-build every seeded profile, plus a placeholder page that
// firebase.json rewrites to for people who join during the demo.
export function generateStaticParams() {
  return [...seedUsers.map((u) => ({ id: u.id })), { id: FALLBACK_PARAM }];
}

export default function Page() {
  return <PersonPage />;
}
