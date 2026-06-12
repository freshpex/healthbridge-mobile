import type { Role, Screen } from "../types/domain";

export const homeForRole: Record<Role | "super_admin", Screen> = {
  patient: "patient",
  doctor: "doctor",
  hospital_admin: "hospital",
  super_admin: "admin",
  emergency_staff: "emergency-dashboard",
  laboratory: "laboratory"
};

export const canOpenEmergency = (role: Role) => role === "emergency_staff" || role === "doctor" || role === "patient";
