"use client";

import { useStore } from "@/lib/store";
import { AlumniHome, PendingAlumniHome, ParentHome, RoleOverview, StaffDashboard, StudentHome } from "@/components/Homes";

export default function PortalHome() {
  const { me } = useStore();
  if (!me) return null;
  switch (me.role) {
    case "STU":
      return <StudentHome me={me} />;
    case "PAR":
      return <ParentHome me={me} />;
    case "ALU":
      return <AlumniHome me={me} />;
    case "ALP":
      return <PendingAlumniHome me={me} />;
    case "CAD":
    case "GAO":
    case "SAD":
      return <StaffDashboard me={me} />;
    default:
      return <RoleOverview me={me} />;
  }
}
